import { db } from '@/db/client';
import { habits, categories, habitScheduleVersions } from '@/db/schema';
import Link from 'next/link';
import { Plus, CheckCircle2 } from 'lucide-react';
import { HabitCard } from '@/components/habits/HabitCard';

export const dynamic = 'force-dynamic';

export default async function HabitsPage() {
  const allHabits = await db.select().from(habits).all();
  const allCategories = await db.select().from(categories).all();
  const allVersions = await db.select().from(habitScheduleVersions).all();

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">فهرست و مدیریت عادات (Habits)</h1>
          <p className="text-sm text-text-muted mt-0.5">
            عادات فعال، زمان‌بندی‌ها، اهداف کمّی و دسته‌بندی‌ها
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

      {allHabits.length === 0 ? (
        <div className="p-8 rounded-xl bg-surface border border-dashed border-border-subtle text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-elevated mx-auto flex items-center justify-center text-text-muted">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-base text-text-main">هنوز عادتی ثبت نکرده‌اید</h3>
          <p className="text-sm text-text-muted max-w-sm mx-auto">
            عادات منظم روزانه و هفتگی برای مطالعات درسی، یادگیری هوش مصنوعی و رشد شخصی ایجاد کنید.
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allHabits.map((habit) => {
            const cat = allCategories.find((c) => c.id === habit.categoryId);
            const version = allVersions.find((v) => v.habitId === habit.id);

            return (
              <HabitCard
                key={habit.id}
                id={habit.id}
                name={habit.name}
                status={habit.status}
                habitType={habit.habitType}
                categoryName={cat?.name || 'عمومی'}
                categoryColor={cat?.colorHex || '#2563EB'}
                scheduleType={version?.scheduleType}
                targetValue={version?.targetValue}
                targetUnit={version?.targetUnit}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
