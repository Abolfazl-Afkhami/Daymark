'use client';

import { useState } from 'react';
import { Check, Flame, Plus } from 'lucide-react';

interface HabitRowProps {
  id: string;
  name: string;
  categoryName: string;
  colorHex: string;
  streak: number;
  habitType: 'BINARY' | 'QUANTITATIVE';
  targetValue?: number | null;
  targetUnit?: string | null;
  currentValue?: number;
  initialCompleted?: boolean;
}

export function HabitRow({
  id,
  name,
  categoryName,
  colorHex,
  streak,
  habitType,
  targetValue,
  targetUnit,
  currentValue = 0,
  initialCompleted = false,
}: HabitRowProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [value, setValue] = useState(currentValue);

  const toggleBinary = () => {
    setCompleted(!completed);
  };

  const incrementQuantitative = () => {
    const nextVal = value + 10;
    setValue(nextVal);
    if (targetValue && nextVal >= targetValue) {
      setCompleted(true);
    }
  };

  return (
    <div className="flex items-center justify-between p-3.5 bg-surface border border-border-subtle rounded-lg shadow-sm hover:border-accent/40 transition-all min-h-[60px]">
      <div className="flex items-center gap-3">
        <span
          className="w-2.5 h-8 rounded-full shrink-0"
          style={{ backgroundColor: colorHex }}
        />
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`font-semibold text-sm transition-colors ${
                completed ? 'line-through text-text-muted' : 'text-text-main'
              }`}
            >
              {name}
            </span>
            {streak > 0 && (
              <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-medium">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{streak} روز</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
            <span>{categoryName}</span>
            {habitType === 'QUANTITATIVE' && targetValue && (
              <>
                <span>•</span>
                <span>
                  {value} / {targetValue} {targetUnit || 'واحد'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {habitType === 'QUANTITATIVE' ? (
          <button
            type="button"
            onClick={incrementQuantitative}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-elevated hover:bg-accent/10 hover:text-accent text-xs font-semibold transition-colors min-h-[44px] min-w-[44px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>۱۰+</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleBinary}
            aria-label={`تکمیل عادت ${name}`}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              completed
                ? 'bg-status-complete text-white scale-105'
                : 'border-2 border-border-subtle hover:border-status-complete text-transparent'
            }`}
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  );
}
