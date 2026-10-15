'use client';

import React, { useState, useTransition } from 'react';
import { CheckCircle2, Circle, FastForward, Plus, Flame } from 'lucide-react';

export interface HabitCheckProps {
  id: string;
  name: string;
  categoryName: string;
  categoryColor: string;
  habitType: 'BINARY' | 'QUANTITATIVE';
  targetValue: number | null;
  targetUnit: string | null;
  currentValue: number;
  currentStatus: 'COMPLETED' | 'PARTIAL' | 'SKIPPED' | 'MISSED' | 'UNLOGGED';
  currentStreak: number;
  onLogHabit: (
    habitId: string,
    status: 'COMPLETED' | 'PARTIAL' | 'SKIPPED',
    value: number
  ) => Promise<any>;
}

export function HabitCheckItem({
  id,
  name,
  categoryName,
  categoryColor,
  habitType,
  targetValue,
  targetUnit,
  currentValue,
  currentStatus,
  currentStreak,
  onLogHabit,
}: HabitCheckProps) {
  const [isPending, startTransition] = useTransition();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [inputValue, setInputValue] = useState<string>(
    String(targetValue || 1)
  );

  const isCompleted = currentStatus === 'COMPLETED';
  const isSkipped = currentStatus === 'SKIPPED';

  const handleBinaryToggle = () => {
    startTransition(async () => {
      const nextStatus = isCompleted ? 'PARTIAL' : 'COMPLETED';
      const nextVal = isCompleted ? 0 : targetValue || 1;
      await onLogHabit(id, nextStatus, nextVal);
    });
  };

  const handleQuantitativeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Math.max(0, Number(inputValue) || 0);
    const target = targetValue || 1;
    const status = val >= target ? 'COMPLETED' : 'PARTIAL';

    startTransition(async () => {
      await onLogHabit(id, status, val);
      setShowCustomInput(false);
    });
  };

  const handleSkip = () => {
    startTransition(async () => {
      await onLogHabit(id, 'SKIPPED', currentValue);
    });
  };

  return (
    <div
      className={`p-3.5 rounded-xl border transition-all ${
        isCompleted
          ? 'bg-status-complete/5 border-status-complete/30'
          : isSkipped
          ? 'bg-elevated/40 border-border-subtle opacity-75'
          : 'bg-surface border-border-subtle hover:border-accent/40'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            disabled={isPending}
            onClick={
              habitType === 'BINARY'
                ? handleBinaryToggle
                : () => setShowCustomInput((prev) => !prev)
            }
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-95 bg-elevated border border-border-subtle"
            title={habitType === 'BINARY' ? 'تغییر وضعیت انجام' : 'ثبت مقدار کمّی'}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-status-complete" />
            ) : isSkipped ? (
              <FastForward className="w-5 h-5 text-status-skipped" />
            ) : (
              <Circle className="w-6 h-6 text-text-muted" />
            )}
          </button>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: categoryColor }}
              />
              <span
                className={`text-sm font-bold truncate ${
                  isCompleted ? 'line-through text-text-muted' : 'text-text-main'
                }`}
              >
                {name}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-muted tabular-nums">
              <span>{categoryName}</span>
              {habitType === 'QUANTITATIVE' && targetValue && (
                <span className="px-2 py-0.5 rounded bg-elevated font-semibold text-text-main">
                  {currentValue} / {targetValue} {targetUnit}
                </span>
              )}
              {currentStreak > 0 && (
                <span className="inline-flex items-center gap-0.5 text-amber-500 font-bold">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  {currentStreak} روز
                </span>
              )}
              {isSkipped && (
                <span className="text-status-skipped font-semibold">
                  معاف شده (استریک محفوظ)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {habitType === 'QUANTITATIVE' && (
            <button
              type="button"
              onClick={() => setShowCustomInput((prev) => !prev)}
              className="px-2.5 py-1.5 rounded-lg bg-elevated hover:bg-accent hover:text-white text-xs font-bold text-text-main border border-border-subtle transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ثبت مقدار</span>
            </button>
          )}

          {!isCompleted && !isSkipped && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleSkip}
              className="p-2 rounded-lg bg-elevated hover:bg-status-skipped/20 text-text-muted hover:text-text-main border border-border-subtle text-xs"
              title="رد کردن مجاز امروز (Skip) بدون شکستن استریک"
            >
              <FastForward className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {showCustomInput && habitType === 'QUANTITATIVE' && (
        <form
          onSubmit={handleQuantitativeSubmit}
          className="mt-3 pt-3 border-t border-border-subtle flex items-center gap-2"
        >
          <input
            type="number"
            step="any"
            min={0}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`مقدار (${targetUnit || 'واحد'})`}
            className="w-32 px-3 py-1.5 rounded-lg border border-border-subtle bg-canvas text-xs tabular-nums font-bold"
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-3.5 py-1.5 rounded-lg bg-accent text-white text-xs font-bold hover:opacity-95"
          >
            ثبت
          </button>
          <button
            type="button"
            onClick={() => {
              setInputValue(String(targetValue || 1));
            }}
            className="px-2.5 py-1.5 rounded-lg bg-elevated text-text-muted hover:text-text-main text-[11px] border border-border-subtle"
          >
            تکمیل کل هدف ({targetValue})
          </button>
        </form>
      )}
    </div>
  );
}
