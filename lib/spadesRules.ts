import type { Player, StandingsRow } from './types';

export const DECK_SIZE = 52;
export const HAND_CAP = 10; // house rule: never deal more than 10 cards even if the deck could support more

// The most cards each player can be dealt this game: capped at 10 by house
// rule, and further capped so everyone can actually be dealt that many
// cards at once (e.g. 6 players -> floor(52/6) = 8).
export function maxCardsForPlayerCount(playerCount: number): number {
  if (playerCount < 2) return 0;
  return Math.min(HAND_CAP, Math.floor(DECK_SIZE / playerCount));
}

// The largest player count that can still be dealt at least 1 card each —
// used to tell the setup screen how many players are allowed.
export function maxPlayerCount(): number {
  return DECK_SIZE; // 1 card each is always dealable; this is a generous ceiling
}

// 1, 2, ..., max, max, max-1, ..., 1 — the "up and down the river" ramp.
// max appears twice in a row (once as the top of the climb, once as the
// start of the descent), matching how Greg's paper sheet is laid out.
export function buildCardsRamp(maxCardsPerHand: number): number[] {
  const up = Array.from({ length: maxCardsPerHand }, (_, i) => i + 1);
  const down = Array.from({ length: maxCardsPerHand }, (_, i) => maxCardsPerHand - i);
  return [...up, ...down];
}

// Dealer rotates through the seating order once per round, wrapping around.
export function dealerForRound(players: Player[], roundNumber: number): Player {
  return players[(roundNumber - 1) % players.length];
}

// The scoring rule: miss low -> 0, hit exactly -> 10 plus your bid, go over
// -> however many tricks you actually took.
export function scoreForBid(bid: number, tricksWon: number): number {
  if (tricksWon < bid) return 0;
  if (tricksWon === bid) return 10 + bid;
  return tricksWon;
}

// How the table's total bids compare to the cards actually in play this
// hand — positive means overbid (more tricks claimed than exist), negative
// means underbid (tricks nobody's claiming), 0 means it matches exactly.
export function bidBalance(bids: Record<string, number>, cardsInHand: number): number {
  const total = Object.values(bids).reduce((sum, b) => sum + b, 0);
  return total - cardsInHand;
}

// Standard competition ranking (1, 1, 3 — ties share a rank, next rank
// skips accordingly), highest total score first.
export function rankPlayers(players: Player[]): StandingsRow[] {
  const sorted = [...players].sort((a, b) => b.totalScore - a.totalScore);
  return sorted.map((player) => ({
    player,
    rank: 1 + sorted.filter((p) => p.totalScore > player.totalScore).length,
  }));
}
