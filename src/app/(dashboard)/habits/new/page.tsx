import { db } from '@/db/client';
import { categories } from '@/db/schema';
import { createHabitAction } from '@/application/actions/habit-actions';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function NewHabitPage() {
  const allCategories = await db.select().from(categories).all();

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/today"
          className="p-1.5 rounded-lg hover:bg-elevated text-text-muted hover:text-text-main transition-colors"
        >
          <ArrowRight className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">تعریف عادت جدید</h1>
          <p className="text-xs text-text-muted">مشخصات و زمان‌بندی عادت خود را وارد کنید</p>
        </div>
      </div>

      <form action={createHabitAction} className="bg-surface p-5 rounded-xl border border-border-subtle shadow-sm space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-xs font-semibold text-text-main">
            عنوان عادت
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="مثلاً: حل تست فیزیک یا تمرین لغت زبان"
            className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label htmlFor="categoryId" className="block text-xs font-semibold text-text-main">
            دسته‌بندی (حوزه زندگی)
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {allCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Habit Type */}
        <div className="space-y-1.5">
          <label htmlFor="habitType" className="block text-xs font-semibold text-text-main">
            نوع عادت
          </label>
          <select
            id="habitType"
            name="habitType"
            className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="BINARY">باینری (انجام شد / نشد)</option>
            <option value="QUANTITATIVE">کمی و قابل اندازه‌گیری (تعداد تست، دقیقه، صفحه)</option>
          </select>
        </div>

        {/* Target and Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="targetValue" className="block text-xs font-semibold text-text-main">
              هدف عددی (اختیاری)
            </label>
            <input
              id="targetValue"
              name="targetValue"
              type="number"
              min="1"
              placeholder="مثلاً: 40"
              className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="targetUnit" className="block text-xs font-semibold text-text-main">
              واحد اندازه‌گیری
            </label>
            <input
              id="targetUnit"
              name="targetUnit"
              type="text"
              placeholder="تست، دقیقه، صفحه"
              className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Schedule */}
        <div className="space-y-1.5">
          <label htmlFor="scheduleType" className="block text-xs font-semibold text-text-main">
            زمان‌بندی
          </label>
          <select
            id="scheduleType"
            name="scheduleType"
            className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="DAILY">هر روز (Daily)</option>
            <option value="WEEKLY_TARGET">تعداد هدف در هفته (Weekly Target)</option>
            <option value="WEEKDAYS">روزهای انتخابی هفته</option>
          </select>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <Link
            href="/today"
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:bg-elevated transition-colors"
          >
            انصراف
          </Link>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:opacity-95 transition-opacity"
          >
            ذخیره عادت
          </button>
        </div>
      </form>
    </div>
  );
}
