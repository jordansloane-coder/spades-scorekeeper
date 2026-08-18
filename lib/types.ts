export interface Player {
  id: string;
  name: string;
  totalScore: number;
}

export interface RoundRecord {
  roundNumber: number; // 1-indexed
  cardsInHand: number;
  dealerId: string;
  bids: Record<string, number>; // playerId -> bid
  tricksWon: Record<string, number>; // playerId -> tricks actually taken
  points: Record<string, number>; // playerId -> points earned this round
}

export type Phase =
  | 'setup' // choosing how many players
  | 'addPlayers' // naming players + setting seating order
  | 'bidding' // entering everyone's bid for the current round
  | 'tricks' // entering everyone's tricks won for the current round
  | 'roundEnd' // standings checkpoint between rounds
  | 'final'; // game over

export interface GameState {
  phase: Phase;
  players: Player[];
  maxCardsPerHand: number; // computed cap based on player count (<=10, deck-limited)
  totalRounds: number; // 2 * maxCardsPerHand
  roundNumber: number; // 1-indexed, valid once phase is past 'addPlayers'
  pendingBids: Record<string, number>; // this round's bids, staged between bidding -> tricks
  history: RoundRecord[];
}

export interface StandingsRow {
  player: Player;
  rank: number;
}
