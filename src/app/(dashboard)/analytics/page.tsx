import { db } from '@/db/client';
import { categories, habitLogs, studySessions, habits } from '@/db/schema';
import { ActivityHeatmap } from '@/components/analytics/ActivityHeatmap';
import { CivilDate } from '@/domain/calendar/civil-date';
import { BarChart3, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const allCategories = await db.select().from(categories).all();
  const allLogs = await db.select().from(habitLogs).all();
  const allSessions = await db.select().from(studySessions).all();

  // Aggregate daily activity counts for heatmap
  const activityMap: Record<CivilDate, number> = {};

  allLogs.forEach((l) => {
    if (l.status === 'COMPLETED') {
      const d = l.logDate as CivilDate;
      activityMap[d] = (activityMap[d] || 0) + 1;
    }
  });

  allSessions.forEach((s) => {
    const d = s.sessionDate as CivilDate;
    activityMap[d] = (activityMap[d] || 0) + 1;
  });

  const totalFocusHours = Math.round(
    allSessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60
  );
  const totalQuestions = allSessions.reduce((acc, s) => acc + (s.questionsCompleted ?? 0), 0);
  const totalCompletedHabitLogs = allLogs.filter((l) => l.status === 'COMPLETED').length;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">آمار و تحلیل عملکرد (Analytics)</h1>
        <p className="text-sm text-text-muted mt-0.5">
          گزارش تحلیلی پیشرفت عادات، زمان‌های تمرکز و روند پیوستگی فعالیت‌ها
        </p>
      </div>

      {/* KPI Overview Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-surface border border-border-subtle shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-status-complete/10 text-status-complete flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-text-muted font-medium">عادات تکمیل‌شده</span>
            <div className="text-xl font-bold text-text-main">{totalCompletedHabitLogs} بار</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border-subtle shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-text-muted font-medium">کل ساعت تمرکز</span>
            <div className="text-xl font-bold text-text-main">{totalFocusHours} ساعت</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border-subtle shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-text-muted font-medium">مجموع تست‌های حل‌شده</span>
            <div className="text-xl font-bold text-text-main">{totalQuestions} تست</div>
          </div>
        </div>
      </section>

      {/* 365-Day Solar Hijri Activity Heatmap */}
      <ActivityHeatmap activityData={activityMap} weeksToShow={32} />

      {/* Category Breakdown */}
      <div className="p-5 rounded-xl bg-surface border border-border-subtle shadow-sm space-y-4">
        <h2 className="text-base font-bold text-text-main">توزیع زمان تمرکز در حوزه‌های زندگی</h2>
        <div className="space-y-3">
          {allCategories.map((cat) => {
            const catSessions = allSessions.filter((s) => s.categoryId === cat.id);
            const catMins = catSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
            const catHours = (catMins / 60).toFixed(1);

            return (
              <div key={cat.id} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.colorHex }}
                    />
                    <span>{cat.name}</span>
                  </div>
                  <span className="text-text-muted">{catHours} ساعت</span>
                </div>
                <div className="w-full h-2 bg-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: totalFocusHours > 0 ? `${Math.min(100, (catMins / (totalFocusHours * 60)) * 100)}%` : '0%',
                      backgroundColor: cat.colorHex,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
