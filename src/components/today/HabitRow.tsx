'use client';

import { HabitCheckItem } from '@/components/habits/HabitCheckItem';
import { logHabitAction } from '@/application/actions/habit-actions';

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
  status?: 'COMPLETED' | 'PARTIAL' | 'SKIPPED' | 'MISSED' | 'UNLOGGED';
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
  status,
}: HabitRowProps) {
  const currentStatus =
    status || (initialCompleted ? 'COMPLETED' : currentValue > 0 ? 'PARTIAL' : 'UNLOGGED');

  return (
    <HabitCheckItem
      id={id}
      name={name}
      categoryName={categoryName}
      categoryColor={colorHex}
      habitType={habitType}
      targetValue={targetValue ?? null}
      targetUnit={targetUnit ?? null}
      currentValue={currentValue}
      currentStatus={currentStatus}
      currentStreak={streak}
      onLogHabit={logHabitAction}
    />
  );
}
