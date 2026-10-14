// src/domain/analytics/metrics.ts
import { CivilDate } from '../calendar/civil-date';

export interface HabitLogMetricEntry {
  habitId: string;
  logDate: CivilDate;
  isScheduled: boolean;
  isPaused: boolean;
  status: 'COMPLETED' | 'PARTIAL' | 'SKIPPED' | 'MISSED';
  value: number;
  targetValueSnapshot: number | null;
}

/**
 * Strict Scheduled Completion Rate (CR_strict):
 * Excludes unscheduled days, paused days, and SKIPPED occurrences from the denominator.
 */
export function computeStrictCompletionRate(
  entries: HabitLogMetricEntry[],
  today: CivilDate
): { rate: number | null; denominator: number; numerator: number } {
  let denominator = 0;
  let numerator = 0;

  for (const entry of entries) {
    const isPast = entry.logDate < today;
    const isTodayLogged = entry.logDate === today && entry.status !== 'MISSED';

    const eligible =
      entry.isScheduled &&
      !entry.isPaused &&
      entry.status !== 'SKIPPED' &&
      (isPast || isTodayLogged);

    if (eligible) {
      denominator++;
      if (entry.status === 'COMPLETED') {
        numerator++;
      }
    }
  }

  if (denominator === 0) {
    return { rate: null, denominator: 0, numerator: 0 };
  }

  return {
    rate: Math.round((numerator / denominator) * 1000) / 10,
    denominator,
    numerator,
  };
}

/**
 * Quantitative Weighted Fulfillment Rate (CR_quant):
 * sum(min(1.0, value / target_snapshot)) / Neval
 */
export function computeQuantitativeFulfillmentRate(
  entries: HabitLogMetricEntry[],
  today: CivilDate
): { rate: number | null; denominator: number } {
  let denominator = 0;
  let sumRatios = 0;

  for (const entry of entries) {
    const isPast = entry.logDate < today;
    const isTodayLogged = entry.logDate === today && entry.status !== 'MISSED';

    const eligible =
      entry.isScheduled &&
      !entry.isPaused &&
      entry.status !== 'SKIPPED' &&
      (isPast || isTodayLogged);

    if (eligible) {
      denominator++;
      const target = entry.targetValueSnapshot && entry.targetValueSnapshot > 0 ? entry.targetValueSnapshot : 1;
      sumRatios += Math.min(1.0, entry.value / target);
    }
  }

  if (denominator === 0) {
    return { rate: null, denominator: 0 };
  }

  return {
    rate: Math.round((sumRatios / denominator) * 1000) / 10,
    denominator,
  };
}

/**
 * Consistently Missed Habit Identification Rule:
 * Trailing 14 completed days: Neval >= 4 AND (CR_strict < 50% OR ConsecutiveMisses >= 3)
 */
export function isConsistentlyMissed(
  trailingEntries: HabitLogMetricEntry[],
  consecutiveMisses: number,
  today: CivilDate
): boolean {
  const { rate, denominator } = computeStrictCompletionRate(trailingEntries, today);
  if (denominator < 4) return false;

  return (rate !== null && rate < 50) || consecutiveMisses >= 3;
}
