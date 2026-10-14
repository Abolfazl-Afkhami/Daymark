'use client';

import { useMemo } from 'react';
import { addCivilDays, CivilDate } from '@/domain/calendar/civil-date';
import { formatCivilDateToJalali } from '@/domain/calendar/jalali';

interface HeatmapDay {
  date: CivilDate;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ActivityHeatmapProps {
  activityData: Record<CivilDate, number>;
  weeksToShow?: number;
}

export function ActivityHeatmap({ activityData, weeksToShow = 26 }: ActivityHeatmapProps) {
  const days = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10) as CivilDate;
    const totalDays = weeksToShow * 7;
    const list: HeatmapDay[] = [];

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = addCivilDays(today, -i);
      const count = activityData[d] || 0;
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count >= 4) level = 4;
      else if (count >= 3) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;

      list.push({ date: d, count, level });
    }

    return list;
  }, [activityData, weeksToShow]);

  const levelColors = {
    0: 'bg-elevated',
    1: 'bg-emerald-500/30',
    2: 'bg-emerald-500/60',
    3: 'bg-emerald-500/80',
    4: 'bg-emerald-500',
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-text-main">
          نقشه حرارتی فعالیت‌های روزانه (Activity Heatmap)
        </h2>
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <span>کمتر</span>
          <span className="w-2.5 h-2.5 rounded-sm bg-elevated" />
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30" />
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60" />
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80" />
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          <span>بیشتر</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
          {days.map((item) => {
            const jalali = formatCivilDateToJalali(item.date);
            return (
              <div
                key={item.date}
                title={`${jalali} (${item.date}): ${item.count} فعالیت ثبت‌شده`}
                className={`w-3.5 h-3.5 rounded-sm transition-all hover:ring-2 hover:ring-accent ${
                  levelColors[item.level]
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
