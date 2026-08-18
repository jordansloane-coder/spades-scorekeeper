'use client';

import { useEffect, useReducer, useRef } from 'react';
import { createInitialState, gameReducer } from '@/lib/gameReducer';
import { clearGameState, loadGameState, saveGameState } from '@/lib/storage';
import { buildCardsRamp, dealerForRound } from '@/lib/spadesRules';
import Header from '@/components/Header';
import SetupScreen from '@/components/SetupScreen';
import AddPlayersScreen from '@/components/AddPlayersScreen';
import BiddingScreen from '@/components/BiddingScreen';
import TricksScreen from '@/components/TricksScreen';
import RoundEndScreen from '@/components/RoundEndScreen';
import FinalScreen from '@/components/FinalScreen';

export default function Home() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const hydrated = useRef(false);

  useEffect(() => {
    const saved = loadGameState();
    if (saved) dispatch({ type: 'LOAD_STATE', state: saved });
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
        navigator.serviceWorker.register(`${basePath}/sw.js`, { scope: `${basePath}/` }).catch(() => {});
      });
    }
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveGameState(state);
  }, [state]);

  function resetGame() {
    if (!confirm('Clear the current game and start over?')) return;
    clearGameState();
    dispatch({ type: 'NEW_PLAYERS' });
  }

  const ramp = state.maxCardsPerHand > 0 ? buildCardsRamp(state.maxCardsPerHand) : [];
  const cardsInHand = ramp[state.roundNumber - 1] ?? 0;
  const dealer = state.players.length > 0 ? dealerForRound(state.players, state.roundNumber) : null;
  const latestRound = state.history[state.history.length - 1];

  return (
    <div className="flex-1 flex flex-col">
      <Header onReset={state.phase !== 'setup' ? resetGame : undefined} />

      {state.phase === 'setup' && <SetupScreen onContinue={() => dispatch({ type: 'GO_TO_ADD_PLAYERS' })} />}

      {state.phase === 'addPlayers' && (
        <AddPlayersScreen
          players={state.players}
          onAddPlayer={(name) => dispatch({ type: 'ADD_PLAYER', name })}
          onRemovePlayer={(id) => dispatch({ type: 'REMOVE_PLAYER', id })}
          onReorderPlayers={(orderedIds) => dispatch({ type: 'REORDER_PLAYERS', orderedIds })}
          onStart={() => dispatch({ type: 'START_GAME' })}
        />
      )}

      {state.phase === 'bidding' && dealer && (
        <BiddingScreen
          players={state.players}
          dealer={dealer}
          roundNumber={state.roundNumber}
          totalRounds={state.totalRounds}
          cardsInHand={cardsInHand}
          onSubmit={(bids) => dispatch({ type: 'SUBMIT_BIDS', bids })}
        />
      )}

      {state.phase === 'tricks' && dealer && (
        <TricksScreen
          players={state.players}
          dealer={dealer}
          roundNumber={state.roundNumber}
          totalRounds={state.totalRounds}
          cardsInHand={cardsInHand}
          bids={state.pendingBids}
          onSubmit={(tricks) => dispatch({ type: 'SUBMIT_TRICKS', tricks })}
        />
      )}

      {state.phase === 'roundEnd' && latestRound && (
        <RoundEndScreen
          players={state.players}
          round={latestRound}
          roundNumber={state.roundNumber}
          totalRounds={state.totalRounds}
          onNext={() => dispatch({ type: 'NEXT_ROUND' })}
        />
      )}

      {state.phase === 'final' && (
        <FinalScreen
          players={state.players}
          onPlayAgain={() => dispatch({ type: 'PLAY_AGAIN' })}
          onNewPlayers={() => {
            clearGameState();
            dispatch({ type: 'NEW_PLAYERS' });
          }}
        />
      )}
    </div>
  );
}
