// src/components/ui/QuickThemeToggle.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { applyThemeImmediately, ThemeMode } from '@/lib/theme';
import { updateThemeAction } from '@/application/actions/settings-actions';
import { Sun, Moon, Book, Sparkles, Keyboard } from 'lucide-react';

const THEME_CYCLE: Array<{ mode: ThemeMode; label: string; icon: React.ReactNode }> = [
  { mode: 'light', label: 'روشن', icon: <Sun className="w-4 h-4 text-amber-500" /> },
  { mode: 'dark', label: 'تاریک', icon: <Moon className="w-4 h-4 text-blue-400" /> },
  { mode: 'sepia', label: 'سپیا (مطالعه)', icon: <Book className="w-4 h-4 text-amber-700" /> },
  { mode: 'oled', label: 'سیاه OLED', icon: <Sparkles className="w-4 h-4 text-indigo-400" /> },
];

export function QuickThemeToggle() {
  const [currentMode, setCurrentMode] = useState<ThemeMode>('dark');
  const [shortcutLabel, setShortcutLabel] = useState<string>('Ctrl+K');

  useEffect(() => {
    const attr = document.documentElement.getAttribute('data-theme') as ThemeMode | null;
    if (attr) setCurrentMode(attr);

    if (typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)) {
      setShortcutLabel('⌘K');
    } else {
      setShortcutLabel('Ctrl+K');
    }
  }, []);

  const cycleNextTheme = () => {
    const idx = THEME_CYCLE.findIndex((t) => t.mode === currentMode);
    const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]!;
    setCurrentMode(next.mode);
    applyThemeImmediately(next.mode);
    updateThemeAction(next.mode).catch(() => {});
  };

  const openCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
  };

  const activeObj = THEME_CYCLE.find((t) => t.mode === currentMode) ?? THEME_CYCLE[1]!;

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={cycleNextTheme}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-elevated hover:bg-accent/15 border border-border-subtle text-xs font-semibold text-text-main transition-colors"
        title="تغییر سریع پوسته (Light / Dark / Sepia / OLED)"
      >
        {activeObj.icon}
        <span className="hidden sm:inline">{activeObj.label}</span>
      </button>

      <button
        type="button"
        onClick={openCommandPalette}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-elevated hover:bg-accent/15 border border-border-subtle text-xs text-text-muted hover:text-text-main transition-colors"
        title={`جستجو و پالت فرمان سریع (${shortcutLabel})`}
      >
        <Keyboard className="w-3.5 h-3.5 text-accent" />
        <kbd className="text-[10px] font-mono font-semibold tracking-tight" dir="ltr">
          {shortcutLabel}
        </kbd>
      </button>
    </div>
  );
}
