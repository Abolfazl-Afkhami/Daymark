import { db } from '@/db/client';
import { goals, categories } from '@/db/schema';
import { GoalCard } from '@/components/goals/GoalCard';
import Link from 'next/link';
import { Plus, Target } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function GoalsPage() {
  const allGoals = await db.select().from(goals).all();
  const allCategories = await db.select().from(categories).all();

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">اهداف شخصی و تحصیلی (Goals)</h1>
          <p className="text-sm text-text-muted mt-0.5">
            اهداف کمّی و کیفی متصل به عادات، پروژه‌ها و زمان تمرکز
          </p>
        </div>
        <Link
          href="/goals/new"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent text-white font-medium text-sm hover:opacity-95 transition-opacity shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>هدف جدید</span>
        </Link>
      </div>

      {allGoals.length === 0 ? (
        <div className="p-8 rounded-xl bg-surface border border-dashed border-border-subtle text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-elevated mx-auto flex items-center justify-center text-text-muted">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-base text-text-main">هنوز هدفی تعریف نکرده‌اید</h3>
          <p className="text-sm text-text-muted max-w-sm mx-auto">
            یک هدف مقداری (مانند حل ۵۰۰ تست کنکور یا ۱۰۰ ساعت کدنویسی) تعریف کنید تا روند رشد خود را بسنجید.
          </p>
          <div className="pt-2">
            <Link
              href="/goals/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white font-medium text-sm hover:opacity-95 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span>تعریف اولین هدف</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allGoals.map((g) => {
            const cat = allCategories.find((c) => c.id === g.categoryId);
            return (
              <GoalCard
                key={g.id}
                id={g.id}
                title={g.title}
                categoryName={cat?.name || 'عمومی'}
                colorHex={cat?.colorHex || '#2563EB'}
                targetValue={g.targetValue}
                currentValue={g.manualCurrentValue}
                unit={g.unit}
                status={g.status}
                progressSource={g.progressSource}
                deadlineDate={g.deadlineDate}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
