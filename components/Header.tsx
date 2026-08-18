'use client';

import { useEffect, useState } from 'react';

interface Props {
  onReset?: () => void;
}

export default function Header({ onReset }: Props) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('spades-dark-mode', String(next));
    } catch {
      // ignore
    }
  }

  return (
    <div className="w-full flex items-center justify-between px-5 py-4">
      <span className="text-xl font-extrabold text-felt dark:text-gold">♠ Spades</span>
      <div className="flex items-center gap-2">
        {onReset && (
          <button
            onClick={onReset}
            aria-label="Reset game"
            className="w-11 h-11 rounded-full bg-card shadow flex items-center justify-center text-lg"
          >
            ↺
          </button>
        )}
        <button
          onClick={toggleDark}
          aria-label="Toggle dark mode"
          className="w-11 h-11 rounded-full bg-card shadow flex items-center justify-center text-lg"
        >
          {dark ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
}
