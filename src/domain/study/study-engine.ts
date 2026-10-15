// src/domain/study/study-engine.ts
import { addDaysToCivilDate, CivilDate } from '../calendar/civil-date';

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;
// 5: تسلط کامل | 4: درست با کمی مکث | 3: درست با دشواری | 2: غلط اما آشنا | 1: فراموشی کامل

export interface ReviewState {
  repetitionCount: number;
  easeFactor: number;
  intervalDays: number;
}

export interface NextReviewResult extends ReviewState {
  nextReviewDate: string;
}

/**
 * محاسبه زمان مرور بعدی بر اساس الگوریتم SuperMemo-2 (SM-2)
 */
export function calculateNextReview(
  current: ReviewState,
  quality: ReviewQuality,
  todayCivilDate: string
): NextReviewResult {
  let { repetitionCount, easeFactor, intervalDays } = current;

  if (quality >= 3) {
    if (repetitionCount === 0) {
      intervalDays = 1;
    } else if (repetitionCount === 1) {
      intervalDays = 3; // برای مطالعه درسی و مهندسی، گام دوم ۳ روزه بهینه‌تر از ۶ روزه است
    } else if (repetitionCount === 2) {
      intervalDays = 7;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitionCount += 1;
  } else {
    repetitionCount = 0;
    intervalDays = 1;
  }

  // به‌روزرسانی ضریب آسانی (Ease Factor)
  const delta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  easeFactor = Math.max(1.3, Number((easeFactor + delta).toFixed(2)));

  const nextReviewDate = addDaysToCivilDate(todayCivilDate as CivilDate, intervalDays);

  return {
    repetitionCount,
    easeFactor,
    intervalDays,
    nextReviewDate,
  };
}

export interface TestMetricsResult {
  rawPercentage: number;          // درصد بدون نمره منفی
  netPercentage: number;          // درصد با نمره منفی (۳ غلط = ۱ درست)
  accuracyRate: number;           // دقت در بین سوالات پاسخ‌داده‌شده
  secondsPerQuestion: number;     // میانگین زمان هر سوال (ثانیه)
}

/**
 * محاسبه شاخص‌های تحلیلی تست‌زنی و حل مسئله
 */
export function calculateTestMetrics(params: {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  durationMinutes: number;
}): TestMetricsResult {
  const { totalQuestions, correctCount, wrongCount, durationMinutes } = params;
  if (totalQuestions <= 0) {
    return { rawPercentage: 0, netPercentage: 0, accuracyRate: 0, secondsPerQuestion: 0 };
  }

  const answered = correctCount + wrongCount;
  const rawPercentage = Number(((correctCount / totalQuestions) * 100).toFixed(1));
  const netScore = ((correctCount * 3 - wrongCount) / (totalQuestions * 3)) * 100;
  const netPercentage = Number(Math.max(-33.3, netScore).toFixed(1));
  const accuracyRate = answered > 0 ? Number(((correctCount / answered) * 100).toFixed(1)) : 0;
  const secondsPerQuestion =
    durationMinutes > 0 ? Math.round((durationMinutes * 60) / totalQuestions) : 0;

  return {
    rawPercentage,
    netPercentage,
    accuracyRate,
    secondsPerQuestion,
  };
}

/**
 * محاسبه نرخ پیشروی روزانه برای رسیدن به هدف (Adaptive Pace Calculator)
 */
export function calculateGoalDailyPace(params: {
  targetValue: number;
  currentValue: number;
  daysRemaining: number;
}): { remainingValue: number; requiredDailyPace: number; isOnTrack: boolean } {
  const remainingValue = Math.max(0, params.targetValue - params.currentValue);
  if (remainingValue === 0) {
    return { remainingValue: 0, requiredDailyPace: 0, isOnTrack: true };
  }
  const effectiveDays = Math.max(1, params.daysRemaining);
  const requiredDailyPace = Number((remainingValue / effectiveDays).toFixed(1));

  return {
    remainingValue,
    requiredDailyPace,
    isOnTrack: params.daysRemaining > 0,
  };
}
