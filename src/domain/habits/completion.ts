// src/domain/habits/completion.ts

export type HabitStatus = 'COMPLETED' | 'PARTIAL' | 'SKIPPED' | 'MISSED';

export function evaluateHabitCompletion(
  habitType: 'BINARY' | 'QUANTITATIVE',
  value: number,
  targetValue: number | null
): { status: HabitStatus; progressRatio: number } {
  if (habitType === 'BINARY') {
    const isDone = value >= 1;
    return {
      status: isDone ? 'COMPLETED' : 'MISSED',
      progressRatio: isDone ? 1 : 0,
    };
  }

  const target = targetValue && targetValue > 0 ? targetValue : 1;
  const ratio = Math.min(1.0, value / target);

  if (value >= target) {
    return { status: 'COMPLETED', progressRatio: ratio };
  } else if (value > 0) {
    return { status: 'PARTIAL', progressRatio: ratio };
  } else {
    return { status: 'MISSED', progressRatio: 0 };
  }
}
