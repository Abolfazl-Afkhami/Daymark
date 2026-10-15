// src/components/today/RetroactiveGapBanner.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { DayGapRecord, UnloggedHabitItem } from '@/application/services/gap-detector';
import { logHabitAction } from '@/application/actions/habit-actions';
import { logStudySessionAction } from '@/application/actions/session-actions';
import { formatAppDate, getActiveCalendarSystem } from '@/lib/date-format';
import { useI18n } from '@/lib/i18n';
import {
  AlertCircle,
  CheckCircle2,
  FastForward,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Plus,
} from 'lucide-react';

interface Props {
  gaps: DayGapRecord[];
  categories: Array<{ id: string; name: string; colorHex: string }>;
}

export function RetroactiveGapBanner({ gaps, categories }: Props) {
  const { t, locale, isRtl } = useI18n();
  const [dismissed, setDismissed] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(gaps[0]?.date || '');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [customMinutes, setCustomMinutes] = useState<number>(45);
  const [customCategoryId, setCustomCategoryId] = useState<string>(
    categories[0]?.id || ''
  );

  if (dismissed || gaps.length === 0) return null;

  const activeRecord = gaps.find((g) => g.date === selectedDate) || gaps[0];
  if (!activeRecord) return null;

  const totalUnloggedHabits = gaps.reduce((acc, g) => acc + g.unloggedHabits.length, 0);
  const calendarSys = getActiveCalendarSystem();

  const handleHabitStatus = (habitId: string, status: 'COMPLETED' | 'SKIPPED') => {
    startTransition(async () => {
      await logHabitAction(habitId, status, status === 'COMPLETED' ? 1 : 0, activeRecord.date);
    });
  };

  const handleQuickStudyLog = (minutes: number) => {
    const targetCatId = customCategoryId || categories[0]?.id;
    if (!targetCatId) return;
    startTransition(async () => {
      await logStudySessionAction({
        categoryId: targetCatId,
        sessionDate: activeRecord.date,
        durationMinutes: minutes,
        sessionType: 'STUDY',
        notes: locale === 'fa' ? 'ثبت عطف به ماسبق از میز کار' : 'Retroactive catch-up session',
      });
    });
  };

  return (
    <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 shadow-xs transition-all">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-text-main truncate">
                {locale === 'fa'
                  ? 'یادآور فعالیت‌های روزهای گذشته (ثبت عطف به ماسبق)'
                  : 'Past Activity Catch-up (Retroactive Logging)'}
              </h3>
              {totalUnloggedHabits > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-status-partial/20 text-status-partial font-bold">
                  {totalUnloggedHabits} {locale === 'fa' ? 'عادت معلق' : 'pending'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-text-muted truncate mt-0.5">
              {locale === 'fa'
                ? 'برای حفظ استمرار و جلوگیری از قطع غیرعمدی استریک‌ها، فعالیت‌های گذشته را تعیین‌تکلیف کنید.'
                : 'Keep your streaks accurate by completing or excusing unlogged past days.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1 rounded-lg text-text-muted hover:bg-elevated hover:text-text-main transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-text-muted hover:bg-elevated hover:text-text-main transition-colors"
            title={locale === 'fa' ? 'بستن یادآور' : 'Dismiss'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3.5 pt-3 border-t border-border-subtle/60 space-y-3">
          {/* Day selection tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {gaps.map((g) => {
              const isSelected = g.date === activeRecord.date;
              const formattedDate = formatAppDate(g.date, calendarSys, 'short');
              const dayLabel =
                g.dayOffset === -1
                  ? t.common.yesterday
                  : `${Math.abs(g.dayOffset)} ${t.common.days} ${locale === 'fa' ? 'قبل' : 'ago'}`;

              return (
                <button
                  key={g.date}
                  type="button"
                  onClick={() => setSelectedDate(g.date)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-accent text-white shadow-xs'
                      : 'bg-surface border border-border-subtle text-text-muted hover:text-text-main hover:bg-elevated'
                  }`}
                >
                  <span>{dayLabel}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-text-muted'}`}>
                    ({formattedDate})
                  </span>
                  {g.unloggedHabits.length > 0 && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-status-partial'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Day Content */}
          <div className="p-3 bg-surface rounded-xl border border-border-subtle space-y-3">
            {/* Unlogged Habits section */}
            {activeRecord.unloggedHabits.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-text-main">
                  <span>
                    {locale === 'fa'
                      ? 'عادت‌های ثبت‌نشده در این روز:'
                      : 'Unlogged habits on this day:'}
                  </span>
                  <span className="text-[11px] text-text-muted font-normal">
                    {activeRecord.unloggedHabits.length} {t.common.active}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeRecord.unloggedHabits.map((habit) => (
                    <div
                      key={habit.id}
                      className="p-2.5 rounded-lg border border-border-subtle bg-elevated/40 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: habit.categoryColor }}
                          />
                          <span className="text-xs font-bold text-text-main truncate">
                            {habit.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-text-muted truncate block mt-0.5">
                          {habit.categoryName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleHabitStatus(habit.id, 'COMPLETED')}
                          className="px-2 py-1 rounded bg-status-complete/15 text-status-complete hover:bg-status-complete hover:text-white text-[11px] font-bold transition-all flex items-center gap-1"
                          title={locale === 'fa' ? 'انجام شد' : 'Complete'}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{locale === 'fa' ? 'انجام' : 'Done'}</span>
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleHabitStatus(habit.id, 'SKIPPED')}
                          className="px-2 py-1 rounded bg-status-skipped/15 text-status-skipped hover:bg-status-skipped hover:text-white text-[11px] font-medium transition-all flex items-center gap-1"
                          title={locale === 'fa' ? 'معاف (حفظ استریک)' : 'Excuse (Keep streak)'}
                        >
                          <FastForward className="w-3 h-3" />
                          <span>{locale === 'fa' ? 'معاف' : 'Skip'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-status-complete flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {locale === 'fa'
                    ? 'تمامی عادات این روز با موفقیت ثبت شده‌اند.'
                    : 'All scheduled habits for this day are logged!'}
                </span>
              </div>
            )}

            {/* Study Catch-up */}
            <div className="pt-2 border-t border-border-subtle/60 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-text-muted" />
                <span className="text-xs text-text-muted">
                  {locale === 'fa' ? 'زمان مطالعه ثبت‌شده:' : 'Logged study time:'}
                </span>
                <span className="text-xs font-bold text-text-main">
                  {activeRecord.focusMinutes}{' '}
                  {activeRecord.focusMinutes === 1 ? t.common.minute : t.common.minutes}
                </span>
              </div>

              {activeRecord.focusMinutes === 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-text-muted">
                    {locale === 'fa' ? 'ثبت سریع:' : 'Quick log:'}
                  </span>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleQuickStudyLog(30)}
                    className="px-2 py-1 rounded bg-elevated hover:bg-accent hover:text-white text-[11px] font-semibold border border-border-subtle transition-all"
                  >
                    +30m
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleQuickStudyLog(60)}
                    className="px-2 py-1 rounded bg-elevated hover:bg-accent hover:text-white text-[11px] font-semibold border border-border-subtle transition-all"
                  >
                    +60m
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleQuickStudyLog(90)}
                    className="px-2 py-1 rounded bg-elevated hover:bg-accent hover:text-white text-[11px] font-semibold border border-border-subtle transition-all"
                  >
                    +90m
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
