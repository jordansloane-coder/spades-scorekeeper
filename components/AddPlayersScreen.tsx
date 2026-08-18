'use client';

import { useEffect, useRef, useState } from 'react';
import type { Player } from '@/lib/types';
import { maxCardsForPlayerCount } from '@/lib/spadesRules';

interface Props {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
  onReorderPlayers: (orderedIds: string[]) => void;
  onStart: () => void;
}

// How long a press must hold before it becomes a drag, so a quick tap (e.g. on
// the remove button) never gets mistaken for the start of a reorder.
const LONG_PRESS_MS = 220;
// If the finger/mouse moves more than this before the long-press timer fires,
// treat it as a scroll attempt and cancel the drag instead of starting one.
const MOVE_CANCEL_PX = 8;

interface DragState {
  id: string;
  startY: number;
  pressTimer: number | null;
  pointerId: number;
}

interface FloatRect {
  left: number;
  width: number;
  height: number;
}

export default function AddPlayersScreen({ players, onAddPlayer, onRemovePlayer, onReorderPlayers, onStart }: Props) {
  const [name, setName] = useState('');

  const [order, setOrder] = useState<string[]>(() => players.map((p) => p.id));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [pointerY, setPointerY] = useState(0);
  const [grabOffsetY, setGrabOffsetY] = useState(0);
  const [floatRect, setFloatRect] = useState<FloatRect | null>(null);
  const rowRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const dragState = useRef<DragState | null>(null);

  // Keep local render order in sync with the players prop (adds/removes),
  // preserving whatever order is already on screen for ids that persist.
  useEffect(() => {
    setOrder((prev) => {
      const incomingIds = players.map((p) => p.id);
      const stillPresent = prev.filter((id) => incomingIds.includes(id));
      const newOnes = incomingIds.filter((id) => !stillPresent.includes(id));
      const merged = [...stillPresent, ...newOnes];
      return merged.length === incomingIds.length ? merged : incomingIds;
    });
  }, [players]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAddPlayer(name);
    setName('');
  }

  function handlePointerDown(id: string, e: React.PointerEvent<HTMLLIElement>) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const startY = e.clientY;
    const timer = window.setTimeout(() => {
      const el = rowRefs.current.get(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        setFloatRect({ left: rect.left, width: rect.width, height: rect.height });
        setGrabOffsetY(startY - rect.top);
      }
      setPointerY(startY);
      setDraggingId(id);
      try {
        el?.setPointerCapture(e.pointerId);
      } catch {
        // Pointer may no longer be active — the drag still works via
        // document-level move tracking through React's event system.
      }
    }, LONG_PRESS_MS);
    dragState.current = { id, startY, pressTimer: timer, pointerId: e.pointerId };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLLIElement>) {
    const ds = dragState.current;
    if (!ds) return;

    if (!draggingId) {
      if (Math.abs(e.clientY - ds.startY) > MOVE_CANCEL_PX && ds.pressTimer) {
        window.clearTimeout(ds.pressTimer);
        dragState.current = null;
      }
      return;
    }

    e.preventDefault();
    setPointerY(e.clientY);

    const floatCenter = e.clientY - grabOffsetY + (floatRect?.height ?? 0) / 2;
    const draggedIndex = order.indexOf(draggingId);
    let newIndex = draggedIndex;
    order.forEach((id, i) => {
      if (i === draggedIndex) return;
      const row = rowRefs.current.get(id);
      if (!row) return;
      const rect = row.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      if (i < draggedIndex && floatCenter < center) newIndex = Math.min(newIndex, i);
      if (i > draggedIndex && floatCenter > center) newIndex = Math.max(newIndex, i);
    });

    if (newIndex !== draggedIndex) {
      setOrder((prev) => {
        const next = [...prev];
        const [moved] = next.splice(draggedIndex, 1);
        next.splice(newIndex, 0, moved);
        return next;
      });
    }
  }

  function endDrag() {
    const ds = dragState.current;
    if (ds?.pressTimer) window.clearTimeout(ds.pressTimer);
    if (draggingId) onReorderPlayers(order);
    dragState.current = null;
    setDraggingId(null);
    setFloatRect(null);
  }

  const orderedPlayers = order.map((id) => players.find((p) => p.id === id)).filter((p): p is Player => !!p);
  const draggingPlayer = draggingId ? orderedPlayers.find((p) => p.id === draggingId) : null;
  const maxCards = players.length >= 2 ? maxCardsForPlayerCount(players.length) : null;

  return (
    <div className="flex-1 flex flex-col items-center px-5 py-8 gap-5 max-w-md mx-auto w-full">
      <div className="text-center animate-pop-in">
        <h2 className="text-2xl font-extrabold">Who&apos;s playing?</h2>
        <p className="mt-1 opacity-70 text-sm">Add each player, then drag to set the seating order.</p>
      </div>

      <form onSubmit={submit} className="w-full flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Player name"
          className="flex-1 rounded-2xl bg-card px-4 py-4 text-lg shadow-inner outline-none ring-2 ring-transparent focus:ring-felt"
          maxLength={20}
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="rounded-2xl bg-felt text-white font-bold px-6 py-4 text-lg shadow disabled:opacity-40"
        >
          Add
        </button>
      </form>

      {players.length > 0 && (
        <p className="text-xs opacity-40 -mb-3 self-start">Press and hold a player to drag them into seating order.</p>
      )}

      <ul className="w-full flex flex-col gap-2">
        {orderedPlayers.map((p, i) => {
          const isDragging = draggingId === p.id;
          return (
            <li
              key={p.id}
              ref={(el) => {
                if (el) rowRefs.current.set(p.id, el);
                else rowRefs.current.delete(p.id);
              }}
              onPointerDown={(e) => handlePointerDown(p.id, e)}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              style={{ touchAction: 'none', visibility: isDragging ? 'hidden' : undefined }}
              className="animate-pop-in flex items-center justify-between rounded-2xl bg-card px-4 py-3 shadow select-none cursor-grab active:cursor-grabbing"
            >
              <span className="flex items-center gap-2 font-semibold text-lg">
                <span className="opacity-30 text-sm">⠿</span>
                {i + 1}. {p.name}
              </span>
              <button
                onClick={() => onRemovePlayer(p.id)}
                aria-label={`Remove ${p.name}`}
                className="w-9 h-9 rounded-full bg-danger/10 text-danger font-bold text-lg shrink-0"
              >
                ×
              </button>
            </li>
          );
        })}
        {players.length === 0 && <p className="text-center opacity-50 py-4">Add at least 2 players to start.</p>}
      </ul>

      {draggingPlayer && floatRect && (
        <li
          style={{
            position: 'fixed',
            top: pointerY - grabOffsetY,
            left: floatRect.left,
            width: floatRect.width,
            height: floatRect.height,
            zIndex: 100,
            pointerEvents: 'none',
          }}
          className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 shadow-2xl scale-105 list-none"
        >
          <span className="flex items-center gap-2 font-semibold text-lg">
            <span className="opacity-30 text-sm">⠿</span>
            {order.indexOf(draggingPlayer.id) + 1}. {draggingPlayer.name}
          </span>
          <span className="w-9 h-9 rounded-full bg-danger/10 text-danger font-bold text-lg shrink-0 flex items-center justify-center">
            ×
          </span>
        </li>
      )}

      {maxCards !== null && (
        <p className="text-sm text-center opacity-60">
          {players.length} players → up to <strong>{maxCards} cards</strong> per hand ({maxCards * 2} rounds total).
        </p>
      )}

      <button
        onClick={onStart}
        disabled={players.length < 2}
        className="mt-auto w-full rounded-2xl bg-felt text-white font-extrabold text-2xl py-5 shadow-lg disabled:opacity-40 active:scale-95 transition-transform"
      >
        Start Game
      </button>
    </div>
  );
}
