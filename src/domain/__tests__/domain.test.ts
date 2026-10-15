import { describe, it, expect } from 'vitest';
import { addCivilDays, getLogicalToday, CivilDate } from '../calendar/civil-date';
import { computeOccurrenceStreaks, ScheduleVersion, PausePeriod, HabitLog } from '../habits/streaks';
import { computeStrictCompletionRate, HabitLogMetricEntry } from '../analytics/metrics';
import {
  calculateNextReview,
  calculateTestMetrics,
  calculateGoalDailyPace,
} from '../study/study-engine';
import { parseCLICommand } from '../cli/command-parser';

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

describe('Study Engine & Engineering Tools', () => {
  it('calculates SM-2 spaced repetition intervals accurately', () => {
    const r1 = calculateNextReview(
      { repetitionCount: 0, easeFactor: 2.5, intervalDays: 1 },
      5,
      '2026-10-14'
    );
    expect(r1.intervalDays).toBe(1);
    expect(r1.repetitionCount).toBe(1);
    expect(r1.nextReviewDate).toBe('2026-10-15');

    const r2 = calculateNextReview(r1, 5, '2026-10-15');
    expect(r2.intervalDays).toBe(3);
    expect(r2.repetitionCount).toBe(2);
    expect(r2.nextReviewDate).toBe('2026-10-18');
  });

  it('calculates negative-marking exam percentage (3 wrong = 1 right)', () => {
    const metrics = calculateTestMetrics({
      totalQuestions: 30,
      correctCount: 21,
      wrongCount: 6,
      durationMinutes: 45,
    });
    expect(metrics.rawPercentage).toBe(70);
    // (21*3 - 6) / (30*3) = 57 / 90 = 63.3%
    expect(metrics.netPercentage).toBe(63.3);
    expect(metrics.secondsPerQuestion).toBe(90);
  });

  it('parses developer CLI quick commands accurately', () => {
    expect(parseCLICommand('f 45m #AI')).toEqual({
      type: 'FOCUS',
      durationMinutes: 45,
      tag: 'AI',
    });
    expect(parseCLICommand('test 20 15 3 فیزیک')).toEqual({
      type: 'TEST_LOG',
      total: 20,
      correct: 15,
      wrong: 3,
      topic: 'فیزیک',
    });
  });

  it('calculates adaptive daily pace for goals', () => {
    const pace = calculateGoalDailyPace({
      targetValue: 300,
      currentValue: 120,
      daysRemaining: 10,
    });
    expect(pace.remainingValue).toBe(180);
    expect(pace.requiredDailyPace).toBe(18);
  });
});

describe('v1.1.2 Mock Exam & Negative Marking Math', () => {
  const calcRawPct = (correct: number, wrong: number, total: number) =>
    Math.round((((correct * 3 - wrong) / (total * 3)) * 100) * 100) / 100;

  it('computes standard 1/3 negative marking percentage accurately', () => {
    // 30 درست، 3 غلط از 40 سوال -> (90 - 3) / 120 = 87 / 120 = 72.5%
    expect(calcRawPct(30, 3, 40)).toBe(72.5);
    // 0 درست، 6 غلط از 30 سوال -> -6 / 90 = -6.67%
    expect(calcRawPct(0, 6, 30)).toBe(-6.67);
  });

  it('computes weighted average across multi-subject mock exams', () => {
    const subjects = [
      { coeff: 4, pct: 75 }, // ریاضی ضریب ۴: ۳۰۰
      { coeff: 3, pct: 60 }, // فیزیک ضریب ۳: ۱۸۰
      { coeff: 2, pct: 50 }, // شیمی ضریب ۲: ۱۰۰
    ];
    const weightedSum = subjects.reduce((acc, s) => acc + s.coeff * s.pct, 0);
    const totalCoeff = subjects.reduce((acc, s) => acc + s.coeff, 0);
    const overall = Math.round((weightedSum / totalCoeff) * 100) / 100;

    // (300 + 180 + 100) / 9 = 580 / 9 = 64.44%
    expect(overall).toBe(64.44);
  });
});

