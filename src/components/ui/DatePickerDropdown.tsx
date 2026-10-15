// src/components/ui/DatePickerDropdown.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as jalaali from 'jalaali-js';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import {
  CalendarSystem,
  UiLocale,
  formatAppDate,
  JALALI_MONTHS_FA,
  JALALI_MONTHS_EN,
  GREGORIAN_MONTHS_FA,
  GREGORIAN_MONTHS_EN,
  toPersianDigits,
} from '@/lib/calendar/format-date';

interface DatePickerDropdownProps {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (isoDate: string) => void;
  calendarSystem?: CalendarSystem;
  locale?: UiLocale;
  placeholder?: string;
  className?: string;
}

function getTodayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseIso(iso: string): [number, number, number] {
  const parts = iso.slice(0, 10).split('-').map(Number);
  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    return [parts[0], parts[1], parts[2]];
  }
  const now = new Date();
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()];
}

function toIsoString(gy: number, gm: number, gd: number): string {
  return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
}

export function DatePickerDropdown({
  name,
  value: controlledValue,
  defaultValue,
  onChange,
  calendarSystem: initialCalSystem = 'persian',
  locale = 'fa',
  placeholder = 'انتخاب تاریخ...',
  className = '',
}: DatePickerDropdownProps) {
  const [internalValue, setInternalValue] = useState<string>(
    controlledValue ?? defaultValue ?? getTodayIso()
  );
  const selectedIso = controlledValue !== undefined ? controlledValue : internalValue;

  const [calMode, setCalMode] = useState<CalendarSystem>(initialCalSystem);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [gy, gm, gd] = parseIso(selectedIso || getTodayIso());
  const initialJalali = jalaali.toJalaali(gy, gm, gd);

  const [viewYear, setViewYear] = useState<number>(
    calMode === 'persian' ? initialJalali.jy : gy
  );
  const [viewMonth, setViewMonth] = useState<number>(
    calMode === 'persian' ? initialJalali.jm : gm
  );

  useEffect(() => {
    setCalMode(initialCalSystem);
  }, [initialCalSystem]);

  useEffect(() => {
    const [cy, cm, cd] = parseIso(selectedIso || getTodayIso());
    if (calMode === 'persian') {
      const j = jalaali.toJalaali(cy, cm, cd);
      setViewYear(j.jy);
      setViewMonth(j.jm);
    } else {
      setViewYear(cy);
      setViewMonth(cm);
    }
  }, [calMode, selectedIso]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSelectIso = (iso: string) => {
    if (controlledValue === undefined) {
      setInternalValue(iso);
    }
    onChange?.(iso);
    setOpen(false);
  };

  const stepMonth = (delta: number) => {
    let nextM = viewMonth + delta;
    let nextY = viewYear;
    if (nextM > 12) {
      nextM = 1;
      nextY += 1;
    } else if (nextM < 1) {
      nextM = 12;
      nextY -= 1;
    }
    setViewMonth(nextM);
    setViewYear(nextY);
  };

  // محاسبه تعداد روزهای ماه و روز هفته شروع ماه
  let daysInMonth = 30;
  let firstDayOfWeek = 0; // 0 = Saturday in Persian layout, 0 = Sunday in Gregorian layout

  if (calMode === 'persian') {
    daysInMonth = jalaali.jalaaliMonthLength(viewYear, viewMonth);
    const firstGreg = jalaali.toGregorian(viewYear, viewMonth, 1);
    const utcDay = new Date(
      Date.UTC(firstGreg.gy, firstGreg.gm - 1, firstGreg.gd, 12, 0, 0)
    ).getUTCDay(); // 0=Sun..6=Sat
    // تبدیل به هفته شمسی با شروع از شنبه (شنبه = 0، یکشنبه = 1، ... جمعه = 6)
    firstDayOfWeek = (utcDay + 1) % 7;
  } else {
    daysInMonth = new Date(Date.UTC(viewYear, viewMonth, 0)).getUTCDate();
    firstDayOfWeek = new Date(Date.UTC(viewYear, viewMonth - 1, 1, 12, 0, 0)).getUTCDay();
  }

  const weekdayHeaders =
    calMode === 'persian'
      ? locale === 'fa'
        ? ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
        : ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr']
      : locale === 'fa'
      ? ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش']
      : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const monthTitle =
    calMode === 'persian'
      ? `${locale === 'fa' ? JALALI_MONTHS_FA[viewMonth - 1] : JALALI_MONTHS_EN[viewMonth - 1]} ${
          locale === 'fa' ? toPersianDigits(viewYear) : viewYear
        }`
      : `${
          locale === 'fa' ? GREGORIAN_MONTHS_FA[viewMonth - 1] : GREGORIAN_MONTHS_EN[viewMonth - 1]
        } ${locale === 'fa' ? toPersianDigits(viewYear) : viewYear}`;

  const todayIso = getTodayIso();

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {name && <input type="hidden" name={name} value={selectedIso} />}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border-subtle bg-canvas hover:border-accent/60 text-xs font-semibold text-text-main transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <span className="truncate">
          {selectedIso
            ? formatAppDate(selectedIso, calMode, locale, 'medium')
            : placeholder}
        </span>
        <CalendarIcon className="w-4 h-4 text-accent shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-72 rounded-xl bg-surface border border-border-subtle shadow-xl p-3.5 space-y-3 start-0">
          {/* Header: Month Navigation & Calendar Mode Toggle */}
          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => stepMonth(-1)}
              className="p-1.5 rounded-lg bg-elevated hover:bg-accent hover:text-white text-text-main transition-colors"
              title="ماه قبل"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            </button>

            <div className="text-xs font-extrabold text-text-main">{monthTitle}</div>

            <button
              type="button"
              onClick={() => stepMonth(1)}
              className="p-1.5 rounded-lg bg-elevated hover:bg-accent hover:text-white text-text-main transition-colors"
              title="ماه بعد"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            </button>
          </div>

          {/* Calendar Type Pill Switcher */}
          <div className="grid grid-cols-2 gap-1 p-0.5 rounded-lg bg-elevated border border-border-subtle text-[11px]">
            <button
              type="button"
              onClick={() => setCalMode('persian')}
              className={`py-1 rounded-md font-bold transition-colors ${
                calMode === 'persian'
                  ? 'bg-accent text-white'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {locale === 'fa' ? 'تقویم شمسی' : 'Solar Hijri'}
            </button>
            <button
              type="button"
              onClick={() => setCalMode('gregorian')}
              className={`py-1 rounded-md font-bold transition-colors ${
                calMode === 'gregorian'
                  ? 'bg-accent text-white'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {locale === 'fa' ? 'تقویم میلادی' : 'Gregorian'}
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekdayHeaders.map((w, i) => (
              <div key={i} className="text-[10px] font-bold text-text-muted py-1">
                {w}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-8" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              let cellIso = '';
              if (calMode === 'persian') {
                const g = jalaali.toGregorian(viewYear, viewMonth, dayNum);
                cellIso = toIsoString(g.gy, g.gm, g.gd);
              } else {
                cellIso = toIsoString(viewYear, viewMonth, dayNum);
              }

              const isSelected = cellIso === selectedIso;
              const isToday = cellIso === todayIso;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectIso(cellIso)}
                  className={`h-8 rounded-lg text-xs font-semibold tabular-nums flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-accent text-white font-bold shadow-xs'
                      : isToday
                      ? 'border border-accent text-accent font-bold bg-accent/10'
                      : 'text-text-main hover:bg-elevated'
                  }`}
                >
                  {locale === 'fa' ? toPersianDigits(dayNum) : dayNum}
                </button>
              );
            })}
          </div>

          {/* Quick Shortcuts Footer */}
          <div className="pt-2 border-t border-border-subtle flex items-center justify-between gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleSelectIso(todayIso)}
              className="flex-1 py-1.5 rounded-md bg-elevated hover:bg-accent hover:text-white text-text-main font-semibold transition-colors"
            >
              {locale === 'fa' ? 'امروز' : 'Today'}
            </button>
            <button
              type="button"
              onClick={() => {
                const yest = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
                handleSelectIso(yest);
              }}
              className="flex-1 py-1.5 rounded-md bg-elevated hover:bg-accent hover:text-white text-text-main font-semibold transition-colors"
            >
              {locale === 'fa' ? 'دیروز' : 'Yesterday'}
            </button>
            <button
              type="button"
              onClick={() => {
                const nextWeek = new Date(Date.now() + 7 * 86_400_000)
                  .toISOString()
                  .slice(0, 10);
                handleSelectIso(nextWeek);
              }}
              className="flex-1 py-1.5 rounded-md bg-elevated hover:bg-accent hover:text-white text-text-main font-semibold transition-colors"
            >
              {locale === 'fa' ? '+۷ روز' : '+7 Days'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
