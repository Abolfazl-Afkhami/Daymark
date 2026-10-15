import { db } from '@/db/client';
import { categories, projects, goals, studySessions } from '@/db/schema';
import { FocusTimer } from '@/components/focus/FocusTimer';
import { desc } from 'drizzle-orm';
import { Clock, BookOpen, CheckCircle } from 'lucide-react';
import { SessionRow } from '@/components/focus/SessionRow';

export const dynamic = 'force-dynamic';

export default async function FocusPage() {
  const allCategories = await db.select().from(categories).all();
  const allProjects = await db.select().from(projects).all();
  const allGoals = await db.select().from(goals).all();
  const recentSessions = await db
    .select()
    .from(studySessions)
    .orderBy(desc(studySessions.createdAt))
    .limit(10)
    .all();

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">جلسات تمرکز و مطالعه (Focus & Study)</h1>
        <p className="text-sm text-text-muted mt-0.5">
          ثبت زمان متمرکز تحصیلی، پروژه‌های کدنویسی و تحقیق هوش مصنوعی بدون تداخل زمانی
        </p>
      </div>

      {/* Focus Timer Widget */}
      <FocusTimer
        categories={allCategories.map((c) => ({ id: c.id, name: c.name, colorHex: c.colorHex }))}
        projects={allProjects.map((p) => ({ id: p.id, title: p.title }))}
        goals={allGoals.map((g) => ({ id: g.id, title: g.title }))}
      />

      {/* Recent Sessions Table */}
      <div className="bg-surface border border-border-subtle rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-text-main flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" />
          <span>آخرین جلسات ثبت‌شده</span>
        </h2>

        {recentSessions.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-6">
            هنوز جلسه‌ای ثبت نشده است. با زدن دکمه «شروع تمرکز» اولین جلسه خود را ثبت کنید.
          </p>
        ) : (
          <div className="divide-y divide-border-subtle">
            {recentSessions.map((session) => {
              const cat = allCategories.find((c) => c.id === session.categoryId);
              return (
                <SessionRow
                  key={session.id}
                  id={session.id}
                  categoryName={cat?.name || 'عمومی'}
                  categoryColor={cat?.colorHex || '#2563EB'}
                  subjectTag={session.subjectTag}
                  sessionType={session.sessionType}
                  sessionDate={session.sessionDate}
                  durationMinutes={session.durationMinutes}
                  questionsCompleted={session.questionsCompleted}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
