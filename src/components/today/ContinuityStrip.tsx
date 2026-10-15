// src/components/today/ContinuityStrip.tsx
'use client';

import React from 'react';
import { CheckCircle2, Clock, Flame, TrendingUp } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface Props {
  habitsCompleted: number;
  habitsTotal: number;
  todayFocusMinutes: number;
  sevenDayAvgFocusMinutes: number;
  todayQuestions: number;
  currentStreakDays: number;
}

export function ContinuityStrip({
  habitsCompleted,
  habitsTotal,
  todayFocusMinutes,
  sevenDayAvgFocusMinutes,
  todayQuestions,
  currentStreakDays,
}: Props) {
  const { t, locale } = useI18n();

  const habitPercent =
    habitsTotal > 0 ? Math.round((habitsCompleted / habitsTotal) * 100) : 0;

  const todayHours = Math.floor(todayFocusMinutes / 60);
  const todayMins = todayFocusMinutes % 60;

  const avgHours = (sevenDayAvgFocusMinutes / 60).toFixed(1);
  const diffFromAvg = todayFocusMinutes - sevenDayAvgFocusMinutes;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Habit Completion Card */}
      <div className="p-4 rounded-xl bg-surface border border-border-subtle shadow-xs flex items-center justify-between">
        <div className="space-y-1.5 min-w-0">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
            {t.today.habitsProgressCard}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-text-main tabular-nums">
              {habitsTotal > 0 ? `${habitsCompleted}/${habitsTotal}` : '0/0'}
            </span>
            <span className="text-xs font-bold text-status-complete">
              ({habitPercent}%)
            </span>
          </div>
          <div className="w-28 sm:w-32 h-1.5 bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-status-complete rounded-full transition-all duration-500"
              style={{ width: `${habitPercent}%` }}
            />
          </div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-status-complete/10 text-status-complete flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      {/* 2. Focused Time Card */}
      <div className="p-4 rounded-xl bg-surface border border-border-subtle shadow-xs flex items-center justify-between">
        <div className="space-y-1 min-w-0">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
            {t.today.focusTimeCard}
          </span>
          <div className="text-xl sm:text-2xl font-black text-text-main tabular-nums truncate">
            {todayHours} {t.common.hour} {todayMins > 0 ? `و ${todayMins} ${t.common.minute}` : ''}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-text-muted truncate">
            <TrendingUp className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>
              {locale === 'fa' ? `میانگین ۷ روز: ${avgHours} س` : `7d Avg: ${avgHours}h`}
            </span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
          <Clock className="w-6 h-6" />
        </div>
      </div>

      {/* 3. Questions / Practice Solved */}
      <div className="p-4 rounded-xl bg-surface border border-border-subtle shadow-xs flex items-center justify-between">
        <div className="space-y-1 min-w-0">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
            {locale === 'fa' ? 'تست‌های حل‌شده امروز' : 'Questions Solved Today'}
          </span>
          <div className="text-2xl font-black text-text-main tabular-nums">
            {todayQuestions}{' '}
            <span className="text-xs font-semibold text-text-muted">
              {t.common.questions}
            </span>
          </div>
          <p className="text-[11px] text-text-muted truncate">
            {todayQuestions > 0
              ? locale === 'fa' ? 'ثبت‌شده در جلسات تمرکز' : 'Recorded in focus sessions'
              : t.today.readyToLog}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <TrendingUp className="w-6 h-6" />
        </div>
      </div>

      {/* 4. Streak & Continuity Momentum */}
      <div className="p-4 rounded-xl bg-surface border border-border-subtle shadow-xs flex items-center justify-between">
        <div className="space-y-1 min-w-0">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
            {locale === 'fa' ? 'زنجیره استمرار' : 'Continuity Streak'}
          </span>
          <div className="flex items-baseline gap-1.5 text-2xl font-black text-text-main tabular-nums">
            <Flame className="w-5 h-5 text-amber-500 inline fill-amber-500 animate-pulse" />
            <span>{currentStreakDays}</span>
            <span className="text-xs font-semibold text-text-muted">{t.common.days}</span>
          </div>
          <p className="text-[11px] text-text-muted truncate">
            {currentStreakDays > 0
              ? locale === 'fa' ? 'استمرار فعال و پایدار' : 'Active streak maintained'
              : locale === 'fa' ? 'اولین روز دوره جدید' : 'Start your streak today'}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
          <Flame className="w-6 h-6 fill-amber-500" />
        </div>
      </div>
    </div>
  );
}
