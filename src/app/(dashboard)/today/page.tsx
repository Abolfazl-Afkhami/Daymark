import { db } from '@/db/client';
import { categories, habits, habitLogs, studySessions } from '@/db/schema';
import { HabitRow } from '@/components/today/HabitRow';
import { SpacedRepetitionDeck } from '@/components/study/SpacedRepetitionDeck';
import { StudyService } from '@/application/services/study-service';
import { getLogicalToday } from '@/domain/calendar/civil-date';
import { Plus, Flame, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  const todayCivilDate = getLogicalToday(new Date(), 'Asia/Tehran', 4);
  const allCategories = await db.select().from(categories).all();
  const allHabits = await db.select().from(habits).all();
  const todaySessions = await db.select().from(studySessions).all();
  const dueReviews = StudyService.getDueReviews(todayCivilDate);

  const totalFocusMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalQuestions = todaySessions.reduce((acc, s) => acc + (s.questionsCompleted ?? 0), 0);

  const hours = Math.floor(totalFocusMinutes / 60);
  const mins = totalFocusMinutes % 60;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">داشبورد امروز</h1>
          <p className="text-sm text-text-muted mt-0.5">
            برنامه‌ریزی، پیگیری عادات و زمان تمرکز روزانه
          </p>
        </div>
        <Link
          href="/habits/new"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent text-white font-medium text-sm hover:opacity-95 transition-opacity shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>عادت جدید</span>
        </Link>
      </div>

      {/* Summary Cards Strip (Section 4.1) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Habits Progress Card */}
        <div className="p-4 rounded-xl bg-surface border border-border-subtle shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-text-muted">پیشرفت عادات امروز</span>
            <div className="text-2xl font-bold text-text-main">
              {allHabits.length > 0 ? `۰ / ${allHabits.length}` : '۰ / ۰'}
            </div>
            <div className="w-36 h-2 bg-elevated rounded-full overflow-hidden">
              <div className="h-full bg-status-complete w-0 rounded-full transition-all" />
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-status-complete/10 text-status-complete flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Focused Time Card */}
        <div className="p-4 rounded-xl bg-surface border border-border-subtle shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-text-muted">زمان تمرکز و مطالعه</span>
            <div className="text-2xl font-bold text-text-main">
              {hours} ساعت و {mins} دقیقه
            </div>
            <p className="text-xs text-text-muted">
              {totalQuestions > 0 ? `${totalQuestions} تست حل‌شده` : 'آماده ثبت اولین جلسه مطالعه'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* Spaced Repetition (SM-2) Daily Deck */}
      <section>
        <SpacedRepetitionDeck items={dueReviews} todayCivilDate={todayCivilDate} />
      </section>

      {/* Core Habit List / Empty State */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-main">عادت‌های زمان‌بندی‌شده</h2>
          <span className="text-xs text-text-muted">{allHabits.length} عادت فعال</span>
        </div>

        {allHabits.length === 0 ? (
          <div className="p-8 rounded-xl bg-surface border border-dashed border-border-subtle text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-elevated mx-auto flex items-center justify-center text-text-muted">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-base text-text-main">عادتی برای امروز ثبت نشده است</h3>
            <p className="text-sm text-text-muted max-w-sm mx-auto">
              اولین عادت شخصی، تحصیلی یا فنی خود را بسازید تا زنجیره پیشرفت خود را آغاز کنید.
            </p>
            <div className="pt-2">
              <Link
                href="/habits/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white font-medium text-sm hover:opacity-95 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                <span>تعریف اولین عادت</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {allHabits.map((habit) => {
              const cat = allCategories.find((c) => c.id === habit.categoryId);
              return (
                <HabitRow
                  key={habit.id}
                  id={habit.id}
                  name={habit.name}
                  categoryName={cat?.name || 'عمومی'}
                  colorHex={cat?.colorHex || '#2563EB'}
                  streak={0}
                  habitType={habit.habitType as 'BINARY' | 'QUANTITATIVE'}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Categories Overview */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-text-main">حوزه‌های زندگی (۴ دسته‌بندی پایه)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allCategories.map((cat) => (
            <div
              key={cat.id}
              className="p-3.5 rounded-lg bg-surface border border-border-subtle flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.colorHex }}
                />
                <span className="text-sm font-semibold text-text-main">{cat.name}</span>
              </div>
              <span className="text-xs text-text-muted">فعال</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
