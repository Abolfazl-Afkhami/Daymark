// src/components/navigation/Header.tsx
'use client';

import Link from 'next/link';
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatAppDate, CalendarSystem, UiLocale } from '@/lib/calendar/format-date';
import { CivilDate } from '@/domain/calendar/civil-date';
import { QuickThemeToggle } from '@/components/ui/QuickThemeToggle';
import { useI18n } from '@/lib/i18n';

export function Header({ currentDate = '2026-10-14' as CivilDate }: { currentDate?: CivilDate }) {
  const { t, locale } = useI18n();
  const [calendarSystem, setCalendarSystem] = useState<CalendarSystem>('persian');

  useEffect(() => {
    const cal = document.documentElement.getAttribute('data-calendar') as CalendarSystem | null;
    if (cal === 'persian' || cal === 'gregorian') {
      setCalendarSystem(cal);
    }
  }, []);

  const uiLoc = (locale || 'fa') as UiLocale;
  const primaryDate = formatAppDate(currentDate, calendarSystem, uiLoc, 'full');
  const secondaryDate =
    calendarSystem === 'persian'
      ? formatAppDate(currentDate, 'gregorian', uiLoc, 'short')
      : formatAppDate(currentDate, 'persian', uiLoc, 'short');

  return (
    <header className="h-14 border-b border-border-subtle bg-surface px-4 flex items-center justify-between shrink-0 gap-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-elevated px-2.5 py-1 rounded-md text-xs font-medium">
          <span className="font-semibold text-text-main">{primaryDate}</span>
          <span className="text-text-muted text-[11px]">({secondaryDate})</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous day"
          className="p-1.5 rounded-md hover:bg-elevated text-text-muted hover:text-text-main transition-colors"
        >
          <ChevronRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
        </button>
        <span className="text-xs font-medium px-2 py-1 bg-elevated rounded">{t.common.today}</span>
        <button
          type="button"
          aria-label="Next day"
          className="p-1.5 rounded-md hover:bg-elevated text-text-muted hover:text-text-main transition-colors"
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
        </button>

        <div className="ms-1 ps-2 border-s border-border-subtle flex items-center gap-2">
          <QuickThemeToggle />
        </div>

        <Link
          href="/settings"
          aria-label="Settings"
          className="md:hidden p-1.5 rounded-md hover:bg-elevated text-text-muted hover:text-text-main transition-colors"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
