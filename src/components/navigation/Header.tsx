'use client';

import Link from 'next/link';
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCivilDateToJalali } from '@/domain/calendar/jalali';
import { CivilDate } from '@/domain/calendar/civil-date';

export function Header({ currentDate = '2026-10-14' as CivilDate }: { currentDate?: CivilDate }) {
  const jalaliDate = formatCivilDateToJalali(currentDate);

  return (
    <header className="h-14 border-b border-border-subtle bg-surface px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-elevated px-2 py-1 rounded-md text-xs font-medium">
          <span>{jalaliDate}</span>
          <span className="text-text-muted">({currentDate})</span>
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
        <span className="text-xs font-medium px-2 py-1 bg-elevated rounded">امروز</span>
        <button
          type="button"
          aria-label="Next day"
          className="p-1.5 rounded-md hover:bg-elevated text-text-muted hover:text-text-main transition-colors"
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
        </button>

        <Link
          href="/settings"
          aria-label="Settings"
          className="md:hidden p-1.5 rounded-md hover:bg-elevated text-text-muted hover:text-text-main transition-colors ms-2"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
