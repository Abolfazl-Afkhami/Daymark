'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as jalaali from 'jalaali-js';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Clock,
} from 'lucide-react';
import {
  formatAppDate,
  getActiveCalendarSystem,
  CalendarSystem,
  PERSIAN_MONTH_NAMES,
  GREGORIAN_MONTH_NAMES,
} from '@/lib/date-format';

interface DatePickerPopoverProps {
  value: string; // YYYY-MM-DD
  onChange?: (date: string) => void;
  name?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  calendarSystem?: CalendarSystem;
  className?: string;
}

const FA_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
const EN_WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function DatePickerPopover({
  value,
  onChange,
  name,
  label,
  required,
  disabled,
  placeholder = 'انتخاب تاریخ...',
  calendarSystem: propCalendarSystem,
  className = '',
}: DatePickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // سیستم تقویم فعال (پیش‌فرض از تنظیمات کاربر در تگ html خوانده می‌شود)
  const [calendarSystem, setCalendarSystem] = useState<CalendarSystem>(
    propCalendarSystem || 'persian'
  );

  useEffect(() => {
    if (!propCalendarSystem) {
      setCalendarSystem(getActiveCalendarSystem());
    }
  }, [propCalendarSystem]);

  // تاریخ انتخاب‌شده به فرمت میلادی YYYY-MM-DD
  const selectedCivil = value || new Date().toISOString().slice(0, 10);
  const [civilParts, setCivilParts] = useState(() => {
    const p = selectedCivil.split('-').map(Number);
    return { gy: p[0] || 2026, gm: p[1] || 1, gd: p[2] || 1 };
  });

  useEffect(() => {
    if (value) {
      const p = value.split('-').map(Number);
      setCivilParts({ gy: p[0] || 2026, gm: p[1] || 1, gd: p[2] || 1 });
    }
  }, [value]);

  // ماه و سال در حال نمایش در تقویم
  const jalaliCurrent = jalaali.toJalaali(civilParts.gy, civilParts.gm, civilParts.gd);
  const [viewJalali, setViewJalali] = useState({
    jy: jalaliCurrent.jy,
    jm: jalaliCurrent.jm,
  });

  const [viewGregorian, setViewGregorian] = useState({
    gy: civilParts.gy,
    gm: civilParts.gm,
  });

  // بستن پاپ‌اور هنگام کلیک خارج از کامپوننت
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // تغییر ماه در حالت شمسی
  const handlePrevMonthJalali = () => {
    setViewJalali((prev) => {
      if (prev.jm === 1) return { jy: prev.jy - 1, jm: 12 };
      return { jy: prev.jy, jm: prev.jm - 1 };
    });
  };

  const handleNextMonthJalali = () => {
    setViewJalali((prev) => {
      if (prev.jm === 12) return { jy: prev.jy + 1, jm: 1 };
      return { jy: prev.jy, jm: prev.jm + 1 };
    });
  };

  // تغییر ماه در حالت میلادی
  const handlePrevMonthGregorian = () => {
    setViewGregorian((prev) => {
      if (prev.gm === 1) return { gy: prev.gy - 1, gm: 12 };
      return { gy: prev.gy, gm: prev.gm - 1 };
    });
  };

  const handleNextMonthGregorian = () => {
    setViewGregorian((prev) => {
      if (prev.gm === 12) return { gy: prev.gy + 1, gm: 1 };
      return { gy: prev.gy, gm: prev.gm + 1 };
    });
  };

  // انتخاب یک روز خاص
  const handleSelectDate = (gy: number, gm: number, gd: number) => {
    const formatted = `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
    onChange?.(formatted);
    setOpen(false);
  };

  // دکمه‌های پرش سریع (امروز، دیروز و فردا)
  const setQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const gy = d.getFullYear();
    const gm = d.getMonth() + 1;
    const gd = d.getDate();
    handleSelectDate(gy, gm, gd);
  };

  // ساخت روزهای ماه شمسی
  const renderJalaliDays = () => {
    const monthLength = jalaali.jalaaliMonthLength(viewJalali.jy, viewJalali.jm);
    // روز اول ماه چه روزی از هفته است؟ (شنبه = 0 ... جمعه = 6)
    const firstGreg = jalaali.toGregorian(viewJalali.jy, viewJalali.jm, 1);
    const firstDate = new Date(firstGreg.gy, firstGreg.gm - 1, firstGreg.gd);
    const startWeekday = (firstDate.getDay() + 1) % 7;

    const cells: React.ReactNode[] = [];

    // خانه‌های خالی ابتدای ماه
    for (let i = 0; i < startWeekday; i++) {
      cells.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    // روزهای ماه
    for (let day = 1; day <= monthLength; day++) {
      const g = jalaali.toGregorian(viewJalali.jy, viewJalali.jm, day);
      const isSelected =
        g.gy === civilParts.gy && g.gm === civilParts.gm && g.gd === civilParts.gd;

      const now = new Date();
      const isToday =
        g.gy === now.getFullYear() &&
        g.gm === now.getMonth() + 1 &&
        g.gd === now.getDate();

      cells.push(
        <button
          key={day}
          type="button"
          onClick={() => handleSelectDate(g.gy, g.gm, g.gd)}
          className={`w-8 h-8 rounded-lg text-xs font-semibold tabular-nums transition-all flex items-center justify-center ${
            isSelected
              ? 'bg-accent text-white shadow-sm font-bold scale-105'
              : isToday
              ? 'border border-accent text-accent hover:bg-accent/15'
              : 'hover:bg-elevated text-text-main'
          }`}
        >
          {day}
        </button>
      );
    }

    return cells;
  };

  // ساخت روزهای ماه میلادی
  const renderGregorianDays = () => {
    const daysInMonth = new Date(viewGregorian.gy, viewGregorian.gm, 0).getDate();
    const firstDate = new Date(viewGregorian.gy, viewGregorian.gm - 1, 1);
    const startWeekday = firstDate.getDay(); // 0 = Sun

    const cells: React.ReactNode[] = [];

    for (let i = 0; i < startWeekday; i++) {
      cells.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        viewGregorian.gy === civilParts.gy &&
        viewGregorian.gm === civilParts.gm &&
        day === civilParts.gd;

      const now = new Date();
      const isToday =
        viewGregorian.gy === now.getFullYear() &&
        viewGregorian.gm === now.getMonth() + 1 &&
        day === now.getDate();

      cells.push(
        <button
          key={day}
          type="button"
          onClick={() => handleSelectDate(viewGregorian.gy, viewGregorian.gm, day)}
          className={`w-8 h-8 rounded-lg text-xs font-semibold tabular-nums transition-all flex items-center justify-center ${
            isSelected
              ? 'bg-accent text-white shadow-sm font-bold scale-105'
              : isToday
              ? 'border border-accent text-accent hover:bg-accent/15'
              : 'hover:bg-elevated text-text-main'
          }`}
        >
          {day}
        </button>
      );
    }

    return cells;
  };

  const formattedDisplay = value
    ? formatAppDate(value, calendarSystem, 'full')
    : placeholder;

  return (
    <div ref={containerRef} className={`relative space-y-1 ${className}`}>
      {label && <label className="block text-xs font-semibold text-text-main">{label}</label>}

      {/* Hidden native input for form submissions */}
      {name && <input type="hidden" name={name} value={value || ''} required={required} />}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas hover:border-accent/40 text-text-main text-xs font-medium flex items-center justify-between gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="w-4 h-4 text-accent shrink-0" />
          <span className="truncate">{formattedDisplay}</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-elevated text-text-muted font-mono shrink-0">
          {calendarSystem === 'persian' ? 'شمسی' : 'میلادی'}
        </span>
      </button>

      {/* Popover Calendar */}
      {open && (
        <div className="absolute z-50 mt-1 start-0 w-72 bg-surface border border-border-subtle rounded-xl p-3 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-100">
          {/* Calendar Header with Month Navigation and Mode Switcher */}
          <div className="flex items-center justify-between gap-1 pb-2 border-b border-border-subtle">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={
                  calendarSystem === 'persian'
                    ? handlePrevMonthJalali
                    : handlePrevMonthGregorian
                }
                className="p-1 rounded-md hover:bg-elevated text-text-muted hover:text-text-main"
                title="ماه قبل"
              >
                <ChevronRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
              </button>

              <button
                type="button"
                onClick={
                  calendarSystem === 'persian'
                    ? handleNextMonthJalali
                    : handleNextMonthGregorian
                }
                className="p-1 rounded-md hover:bg-elevated text-text-muted hover:text-text-main"
                title="ماه بعد"
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
              </button>
            </div>

            <div className="text-xs font-bold text-text-main tabular-nums">
              {calendarSystem === 'persian'
                ? `${PERSIAN_MONTH_NAMES[viewJalali.jm - 1]} ${viewJalali.jy}`
                : `${GREGORIAN_MONTH_NAMES[viewGregorian.gm - 1]} ${viewGregorian.gy}`}
            </div>

            {/* Toggle Calendar System Button */}
            <button
              type="button"
              onClick={() =>
                setCalendarSystem((prev) => (prev === 'persian' ? 'gregorian' : 'persian'))
              }
              className="text-[10px] px-2 py-0.5 rounded bg-elevated text-accent hover:bg-accent/15 font-semibold transition-colors"
              title="سوئیچ بین تقویم شمسی و میلادی"
            >
              {calendarSystem === 'persian' ? 'میلادی' : 'شمسی'}
            </button>
          </div>

          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {(calendarSystem === 'persian' ? FA_WEEKDAYS : EN_WEEKDAYS).map((day) => (
              <span key={day} className="text-[10px] font-bold text-text-muted py-0.5">
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarSystem === 'persian' ? renderJalaliDays() : renderGregorianDays()}
          </div>

          {/* Quick Presets Strip */}
          <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => setQuickDate(-1)}
              className="px-2 py-1 rounded bg-elevated text-text-muted hover:text-text-main hover:bg-border-subtle transition-colors"
            >
              دیروز
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(0)}
              className="px-2.5 py-1 rounded bg-accent/15 text-accent font-bold hover:bg-accent/25 transition-colors"
            >
              امروز
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(1)}
              className="px-2 py-1 rounded bg-elevated text-text-muted hover:text-text-main hover:bg-border-subtle transition-colors"
            >
              فردا
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(7)}
              className="px-2 py-1 rounded bg-elevated text-text-muted hover:text-text-main hover:bg-border-subtle transition-colors"
            >
              +۷ روز
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
