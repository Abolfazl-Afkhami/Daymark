// src/app/(dashboard)/today/page.tsx
import { db, sqlite } from '@/db/client';
import { categories, habits, habitLogs, studySessions } from '@/db/schema';
import { HabitRow } from '@/components/today/HabitRow';
import { SpacedRepetitionDeck } from '@/components/study/SpacedRepetitionDeck';
import { StudyService } from '@/application/services/study-service';
import { GapDetectorService } from '@/application/services/gap-detector';
import { RetroactiveGapBanner } from '@/components/today/RetroactiveGapBanner';
import { QuickLaunchpad } from '@/components/today/QuickLaunchpad';
import { ContinuityStrip } from '@/components/today/ContinuityStrip';
import { TodayTasksCard, UrgentTaskItem } from '@/components/today/TodayTasksCard';
import { getLogicalToday, addCivilDays, CivilDate } from '@/domain/calendar/civil-date';
import { formatAppDate } from '@/lib/date-format';
import { getDictionary, Locale } from '@/lib/i18n';
import { Plus, CheckCircle2, Target, BookOpen, Layers } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function calculateCurrentStreak(todayCivil: CivilDate): number {
  let streak = 0;
  const todayCount = sqlite
    .prepare(
      `SELECT (
        (SELECT COUNT(*) FROM habit_logs WHERE log_date = ? AND status IN ('COMPLETED', 'SKIPPED')) +
        (SELECT COUNT(*) FROM study_sessions WHERE session_date = ?)
      ) as total`
    )
    .get(todayCivil, todayCivil) as { total: number };

  if (todayCount.total > 0) {
    streak++;
  }

  for (let i = 1; i <= 60; i++) {
    const past = addCivilDays(todayCivil, -i);
    const row = sqlite
      .prepare(
        `SELECT (
          (SELECT COUNT(*) FROM habit_logs WHERE log_date = ? AND status IN ('COMPLETED', 'SKIPPED')) +
          (SELECT COUNT(*) FROM study_sessions WHERE session_date = ?)
        ) as total`
      )
      .get(past, past) as { total: number };
    if (row.total > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export default async function TodayPage() {
  const prefs = (await db.query.appPreferences.findFirst()) || {
    uiLocale: 'fa',
    calendarSystem: 'persian',
    timeZone: 'Asia/Tehran',
    dayRolloverHour: 4,
    theme: 'system',
  };

  const currentLocale = (prefs.uiLocale || 'fa') as Locale;
  const t = getDictionary(currentLocale);
  const calendarSys = (prefs.calendarSystem || 'persian') as 'persian' | 'gregorian';

  const todayCivilDate = getLogicalToday(
    new Date(),
    prefs.timeZone || 'Asia/Tehran',
    prefs.dayRolloverHour ?? 4
  );

  // Queries
  const allCategories = await db.select().from(categories).all();
  const allHabits = await db.select().from(habits).all();
  const activeHabits = allHabits.filter((h) => h.status === 'ACTIVE');

  const todaySessions = sqlite
    .prepare('SELECT duration_minutes, questions_completed FROM study_sessions WHERE session_date = ?')
    .all(todayCivilDate) as Array<{ duration_minutes: number; questions_completed: number | null }>;

  const dueReviews = StudyService.getDueReviews(todayCivilDate);
  const gaps = GapDetectorService.getPast7DaysGaps(todayCivilDate);

  const todayLogs = sqlite
    .prepare('SELECT habit_id, status, value FROM habit_logs WHERE log_date = ?')
    .all(todayCivilDate) as Array<{
    habit_id: string;
    status: 'COMPLETED' | 'PARTIAL' | 'SKIPPED' | 'MISSED';
    value: number;
  }>;
  const todayLogsMap = new Map(todayLogs.map((l) => [l.habit_id, l]));

  const allVersions = sqlite
    .prepare('SELECT habit_id, target_value, target_unit FROM habit_schedule_versions')
    .all() as Array<{
    habit_id: string;
    target_value: number | null;
    target_unit: string | null;
  }>;
  const versionsMap = new Map(allVersions.map((v) => [v.habit_id, v]));

  // 7-day average calculation
  const sevenDaysAgoCivil = addCivilDays(todayCivilDate, -7);
  const past7DaysSessionSum = sqlite
    .prepare(
      `SELECT COALESCE(SUM(duration_minutes), 0) as total_min
       FROM study_sessions
       WHERE session_date >= ? AND session_date < ?`
    )
    .get(sevenDaysAgoCivil, todayCivilDate) as { total_min: number };
  const sevenDayAvgFocusMinutes = Math.round((past7DaysSessionSum?.total_min ?? 0) / 7);

  // Today totals
  const completedHabitsCount = todayLogs.filter(
    (l) => l.status === 'COMPLETED' || l.status === 'SKIPPED'
  ).length;
  const totalFocusMinutes = todaySessions.reduce((acc, s) => acc + s.duration_minutes, 0);
  const totalQuestions = todaySessions.reduce((acc, s) => acc + (s.questions_completed ?? 0), 0);
  const streakDays = calculateCurrentStreak(todayCivilDate);

  // Priority tasks
  const priorityTasks = sqlite
    .prepare(
      `SELECT t.id, t.project_id as projectId, p.title as projectTitle,
              t.title, t.status, t.priority, t.due_date as dueDate
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE (t.status != 'DONE' AND (t.due_date <= ? OR t.priority IN ('CRITICAL', 'HIGH')))
          OR (t.status = 'DONE' AND date(t.completed_at) = ?)
       ORDER BY CASE t.priority WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END, t.due_date ASC
       LIMIT 6`
    )
    .all(todayCivilDate, todayCivilDate) as UrgentTaskItem[];

  const formattedDate = formatAppDate(todayCivilDate, calendarSys, 'full');

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-text-main">
              {t.today.title}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">
              {formattedDate}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            {t.today.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/habits/new"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent text-white font-semibold text-xs hover:opacity-95 transition-opacity shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t.habits.newHabit}</span>
          </Link>
          <Link
            href="/focus"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface border border-border-subtle hover:bg-elevated text-text-main font-semibold text-xs transition-colors shadow-xs"
          >
            <BookOpen className="w-4 h-4 text-status-complete" />
            <span>{t.focus.startFocus}</span>
          </Link>
        </div>
      </div>

      {/* 2. Quick Launchpad Dock */}
      <QuickLaunchpad />

      {/* 3. Retroactive Unlogged Gap Detector (Catch-up retention banner) */}
      <RetroactiveGapBanner
        gaps={gaps}
        categories={allCategories.map((c) => ({
          id: c.id,
          name: c.name,
          colorHex: c.colorHex,
        }))}
      />

      {/* 4. Continuity & Momentum Strip */}
      <ContinuityStrip
        habitsCompleted={completedHabitsCount}
        habitsTotal={activeHabits.length}
        todayFocusMinutes={totalFocusMinutes}
        sevenDayAvgFocusMinutes={sevenDayAvgFocusMinutes}
        todayQuestions={totalQuestions}
        currentStreakDays={streakDays}
      />

      {/* 5. Main 2-Column Work Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width): Scheduled Habits */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-status-complete" />
              <h2 className="text-base font-bold text-text-main">
                {t.today.scheduledHabits}
              </h2>
            </div>
            <span className="text-xs text-text-muted font-medium">
              {activeHabits.length} {t.common.active}
            </span>
          </div>

          {activeHabits.length === 0 ? (
            <div className="p-8 rounded-xl bg-surface border border-dashed border-border-subtle text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-elevated mx-auto flex items-center justify-center text-text-muted">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-text-main">
                {t.today.noHabitsToday}
              </h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                {currentLocale === 'fa'
                  ? 'اولین عادت شخصی، تحصیلی یا فنی خود را بسازید تا زنجیره پیشرفت خود را آغاز کنید.'
                  : 'Define your first technical or personal habit to start your consistency streak.'}
              </p>
              <div className="pt-2">
                <Link
                  href="/habits/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white font-semibold text-xs hover:opacity-95 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.today.defineFirstHabit}</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeHabits.map((habit) => {
                const cat = allCategories.find((c) => c.id === habit.categoryId);
                const ver = versionsMap.get(habit.id);
                const log = todayLogsMap.get(habit.id);
                return (
                  <HabitRow
                    key={habit.id}
                    id={habit.id}
                    name={habit.name}
                    categoryName={cat?.name || 'عمومی'}
                    colorHex={cat?.colorHex || '#2563EB'}
                    streak={streakDays}
                    habitType={habit.habitType as 'BINARY' | 'QUANTITATIVE'}
                    targetValue={ver?.target_value}
                    targetUnit={ver?.target_unit}
                    currentValue={log?.value ?? 0}
                    status={log?.status}
                    initialCompleted={log?.status === 'COMPLETED'}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (1/3 width): SM-2 Reviews Deck & Urgent Tasks */}
        <div className="space-y-6">
          {/* Spaced Repetition (SM-2) Daily Deck */}
          <section className="space-y-2.5">
            <SpacedRepetitionDeck items={dueReviews} todayCivilDate={todayCivilDate} />
          </section>

          {/* Today's Urgent & Priority Tasks */}
          <section className="space-y-2.5">
            <TodayTasksCard tasks={priorityTasks} />
          </section>

          {/* Life Areas (Categories Overview) */}
          <section className="p-4 rounded-xl bg-surface border border-border-subtle shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-bold text-text-main">
                  {t.today.lifeAreasTitle}
                </h3>
              </div>
              <Link
                href="/settings"
                className="text-[11px] text-accent hover:underline font-semibold"
              >
                {t.common.edit}
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {allCategories.map((cat) => {
                const catHabitsCount = activeHabits.filter((h) => h.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="p-2.5 rounded-lg border border-border-subtle bg-elevated/30 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.colorHex }}
                      />
                      <span className="text-xs font-bold text-text-main truncate">
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-muted font-mono font-semibold ms-1">
                      {catHabitsCount}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
