// src/domain/habits/recurrence.ts
import { CivilDate, diffCivilDays, getDayOfWeek } from '../calendar/civil-date';

export function isHabitScheduledOnDate(
  habit: { startDate: CivilDate; endDate: CivilDate | null },
  version: {
    scheduleType: 'DAILY' | 'WEEKDAYS' | 'WEEKLY_TARGET' | 'INTERVAL';
    effectiveFromDate: CivilDate;
    weekdaysMask: number | null;
    intervalDays: number | null;
  },
  pausePeriods: Array<{ pausedFromDate: CivilDate; pausedToDate: CivilDate | null }>,
  date: CivilDate
): boolean {
  if (date < habit.startDate) return false;
  if (habit.endDate && date > habit.endDate) return false;

  // Check if date falls within any pause period
  for (const pause of pausePeriods) {
    const inPause =
      date >= pause.pausedFromDate &&
      (pause.pausedToDate === null || date <= pause.pausedToDate);
    if (inPause) return false;
  }

  switch (version.scheduleType) {
    case 'DAILY':
      return true;
    case 'WEEKDAYS': {
      const dow = getDayOfWeek(date);
      const mask = version.weekdaysMask ?? 0;
      return (mask & (1 << dow)) !== 0;
    }
    case 'INTERVAL': {
      const step = version.intervalDays ?? 1;
      const elapsed = diffCivilDays(date, version.effectiveFromDate);
      return elapsed >= 0 && elapsed % step === 0;
    }
    case 'WEEKLY_TARGET':
      // Every non-paused day in the active window is eligible for logging toward the weekly target
      return true;
  }
}
