import { describe, it, expect } from 'vitest';
import { addCivilDays, getLogicalToday, CivilDate } from '../calendar/civil-date';
import { computeOccurrenceStreaks, ScheduleVersion, PausePeriod, HabitLog } from '../habits/streaks';
import { computeStrictCompletionRate, HabitLogMetricEntry } from '../analytics/metrics';

describe('Domain Engine Tests (Section 9.2 & 7.3)', () => {
  it('TC-DOM-01: DST Spring Forward date stepping', () => {
    // 2026-03-08 is DST transition Sunday in US
    const dNext = addCivilDays('2026-03-08', 1);
    expect(dNext).toBe('2026-03-09');
  });

  it('TC-DOM-02: Rollover Hour Boundary', () => {
    // 2026-10-14T02:30:00+03:30 is 2026-10-13T23:00:00Z
    const testInstantUtc = new Date('2026-10-13T23:00:00Z');
    const logicalToday = getLogicalToday(testInstantUtc, 'Asia/Tehran', 4);
    expect(logicalToday).toBe('2026-10-13');
  });

  it('STR-01: Daily habit streak evaluation with unlogged today', () => {
    const habit = { startDate: '2026-01-01' as CivilDate, endDate: null };
    const versions: ScheduleVersion[] = [{
      scheduleType: 'DAILY',
      effectiveFromDate: '2026-01-01' as CivilDate,
      effectiveToDate: null,
      weekdaysMask: null,
      intervalDays: null,
    }];
    const pauses: PausePeriod[] = [];
    const logs = new Map<CivilDate, HabitLog>([
      ['2026-01-01', { status: 'COMPLETED' }],
      ['2026-01-02', { status: 'COMPLETED' }],
      ['2026-01-03', { status: 'MISSED' }],
      ['2026-01-04', { status: 'COMPLETED' }],
      ['2026-01-05', { status: 'COMPLETED' }],
      ['2026-01-06', { status: 'COMPLETED' }],
      // 2026-01-07 is today and unlogged
    ]);

    const result = computeOccurrenceStreaks(habit, versions, pauses, logs, '2026-01-07' as CivilDate);
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
  });

  it('TC-ANA-06: Denominator Exclusion', () => {
    // Habit scheduled Mon/Wed/Fri (3 days/week). In a completed 7-day week:
    // Mon=COMPLETED, Wed=SKIPPED, Fri=MISSED. Tue/Thu/Sat/Sun unscheduled.
    const entries: HabitLogMetricEntry[] = [
      { habitId: 'h1', logDate: '2026-01-05', isScheduled: true, isPaused: false, status: 'COMPLETED', value: 1, targetValueSnapshot: 1 },
      { habitId: 'h1', logDate: '2026-01-06', isScheduled: false, isPaused: false, status: 'SKIPPED', value: 0, targetValueSnapshot: null },
      { habitId: 'h1', logDate: '2026-01-07', isScheduled: true, isPaused: false, status: 'SKIPPED', value: 0, targetValueSnapshot: 1 },
      { habitId: 'h1', logDate: '2026-01-08', isScheduled: false, isPaused: false, status: 'SKIPPED', value: 0, targetValueSnapshot: null },
      { habitId: 'h1', logDate: '2026-01-09', isScheduled: true, isPaused: false, status: 'MISSED', value: 0, targetValueSnapshot: 1 },
      { habitId: 'h1', logDate: '2026-01-10', isScheduled: false, isPaused: false, status: 'SKIPPED', value: 0, targetValueSnapshot: null },
      { habitId: 'h1', logDate: '2026-01-11', isScheduled: false, isPaused: false, status: 'SKIPPED', value: 0, targetValueSnapshot: null },
    ];

    const result = computeStrictCompletionRate(entries, '2026-01-12' as CivilDate);
    // Unscheduled days (4) and SKIPPED day (1) excluded. Denominator = 2, Numerator = 1 -> 50%
    expect(result.denominator).toBe(2);
    expect(result.numerator).toBe(1);
    expect(result.rate).toBe(50.0);
  });
});
