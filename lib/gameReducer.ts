import type { GameState, Player, RoundRecord } from './types';
import { buildCardsRamp, maxCardsForPlayerCount, scoreForBid } from './spadesRules';

export type Action =
  | { type: 'GO_TO_ADD_PLAYERS' }
  | { type: 'ADD_PLAYER'; name: string }
  | { type: 'REMOVE_PLAYER'; id: string }
  | { type: 'REORDER_PLAYERS'; orderedIds: string[] }
  | { type: 'START_GAME' }
  | { type: 'SUBMIT_BIDS'; bids: Record<string, number> }
  | { type: 'SUBMIT_TRICKS'; tricks: Record<string, number> }
  | { type: 'NEXT_ROUND' }
  | { type: 'PLAY_AGAIN' } // same players, scores reset
  | { type: 'NEW_PLAYERS' } // full reset
  | { type: 'LOAD_STATE'; state: GameState };

export function createInitialState(): GameState {
  return {
    phase: 'setup',
    players: [],
    maxCardsPerHand: 0,
    totalRounds: 0,
    roundNumber: 0,
    pendingBids: {},
    history: [],
  };
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'GO_TO_ADD_PLAYERS':
      return { ...state, phase: 'addPlayers' };

    case 'ADD_PLAYER': {
      const name = action.name.trim();
      if (!name) return state;
      const player: Player = { id: crypto.randomUUID(), name, totalScore: 0 };
      return { ...state, players: [...state.players, player] };
    }

    case 'REMOVE_PLAYER':
      return { ...state, players: state.players.filter((p) => p.id !== action.id) };

    case 'REORDER_PLAYERS': {
      const byId = new Map(state.players.map((p) => [p.id, p]));
      const players = action.orderedIds.map((id) => byId.get(id)).filter((p): p is Player => !!p);
      if (players.length !== state.players.length) return state;
      return { ...state, players };
    }

    case 'START_GAME': {
      if (state.players.length < 2) return state;
      const maxCardsPerHand = maxCardsForPlayerCount(state.players.length);
      return {
        ...state,
        phase: 'bidding',
        maxCardsPerHand,
        totalRounds: maxCardsPerHand * 2,
        roundNumber: 1,
        pendingBids: {},
        history: [],
      };
    }

    case 'SUBMIT_BIDS':
      return { ...state, phase: 'tricks', pendingBids: action.bids };

    case 'SUBMIT_TRICKS': {
      const ramp = buildCardsRamp(state.maxCardsPerHand);
      const cardsInHand = ramp[state.roundNumber - 1];
      const dealer = state.players[(state.roundNumber - 1) % state.players.length];

      const points: Record<string, number> = {};
      for (const p of state.players) {
        points[p.id] = scoreForBid(state.pendingBids[p.id] ?? 0, action.tricks[p.id] ?? 0);
      }

      const record: RoundRecord = {
        roundNumber: state.roundNumber,
        cardsInHand,
        dealerId: dealer.id,
        bids: state.pendingBids,
        tricksWon: action.tricks,
        points,
      };

      const players = state.players.map((p) => ({ ...p, totalScore: p.totalScore + points[p.id] }));

      return {
        ...state,
        phase: 'roundEnd',
        players,
        pendingBids: {},
        history: [...state.history, record],
      };
    }

    case 'NEXT_ROUND': {
      if (state.roundNumber >= state.totalRounds) {
        return { ...state, phase: 'final' };
      }
      return { ...state, phase: 'bidding', roundNumber: state.roundNumber + 1 };
    }

    case 'PLAY_AGAIN': {
      const players = state.players.map((p) => ({ ...p, totalScore: 0 }));
      return {
        ...state,
        phase: 'addPlayers',
        players,
        maxCardsPerHand: 0,
        totalRounds: 0,
        roundNumber: 0,
        pendingBids: {},
        history: [],
      };
    }

    case 'NEW_PLAYERS':
      return createInitialState();

    case 'LOAD_STATE':
      return action.state;

    default:
      return state;
  }
}
