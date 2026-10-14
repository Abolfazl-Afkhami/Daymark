// src/domain/habits/streaks.ts
import { CivilDate, addCivilDays } from '../calendar/civil-date';
import { isHabitScheduledOnDate } from './recurrence';

export interface HabitEntity {
  startDate: CivilDate;
  endDate: CivilDate | null;
}

export interface ScheduleVersion {
  scheduleType: 'DAILY' | 'WEEKDAYS' | 'WEEKLY_TARGET' | 'INTERVAL';
  effectiveFromDate: CivilDate;
  effectiveToDate: CivilDate | null;
  weekdaysMask: number | null;
  intervalDays: number | null;
}

export interface PausePeriod {
  pausedFromDate: CivilDate;
  pausedToDate: CivilDate | null;
}

export interface HabitLog {
  status: 'COMPLETED' | 'PARTIAL' | 'SKIPPED' | 'MISSED';
  value?: number;
}

export interface StreakResult {
  unit: 'DAYS' | 'WEEKS';
  currentStreak: number;
  longestStreak: number;
  isCompletedToday: boolean;
}

export function resolveVersionForDate(
  versions: ScheduleVersion[],
  date: CivilDate
): ScheduleVersion | undefined {
  return versions.find(
    (v) =>
      date >= v.effectiveFromDate &&
      (v.effectiveToDate === null || date <= v.effectiveToDate)
  );
}

export function computeOccurrenceStreaks(
  habit: HabitEntity,
  versions: ScheduleVersion[],
  pauses: PausePeriod[],
  logsByDate: Map<CivilDate, HabitLog>,
  today: CivilDate
): StreakResult {
  const upperBound =
    habit.endDate && habit.endDate < today ? habit.endDate : today;
  if (habit.startDate > upperBound) {
    return { unit: 'DAYS', currentStreak: 0, longestStreak: 0, isCompletedToday: false };
  }

  let runningStreak = 0;
  let longestStreak = 0;
  let cursor = habit.startDate;

  while (cursor <= upperBound) {
    const version = resolveVersionForDate(versions, cursor);
    const scheduled = version
      ? isHabitScheduledOnDate(habit, version, pauses, cursor)
      : false;
    const log = logsByDate.get(cursor);

    if (!scheduled) {
      // Unscheduled or paused day: NEUTRAL
    } else if (log?.status === 'COMPLETED') {
      runningStreak += 1;
      if (runningStreak > longestStreak) longestStreak = runningStreak;
    } else if (log?.status === 'SKIPPED') {
      // Excused day: NEUTRAL (neither increments nor resets)
    } else if (cursor === today) {
      // Current day has not ended yet: PENDING_TODAY (do not reset)
    } else {
      // Past scheduled day was MISSED, PARTIAL, or unlogged: RESET
      runningStreak = 0;
    }

    cursor = addCivilDays(cursor, 1);
  }

  const todayLog = logsByDate.get(today);
  return {
    unit: 'DAYS',
    currentStreak: runningStreak,
    longestStreak,
    isCompletedToday: todayLog?.status === 'COMPLETED',
  };
}
