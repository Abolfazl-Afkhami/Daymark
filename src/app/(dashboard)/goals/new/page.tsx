import { db } from '@/db/client';
import { categories } from '@/db/schema';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createGoalAction } from '@/application/actions/goal-actions';

export default async function NewGoalPage() {
  const allCategories = await db.select().from(categories).all();

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/goals"
          className="p-1.5 rounded-lg hover:bg-elevated text-text-muted hover:text-text-main transition-colors"
        >
          <ArrowRight className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">تعریف هدف جدید (New Goal)</h1>
          <p className="text-xs text-text-muted">مشخصات هدف بلندمدت یا مقداری خود را وارد کنید</p>
        </div>
      </div>

      <form action={createGoalAction} className="bg-surface p-5 rounded-xl border border-border-subtle shadow-sm space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <label htmlFor="title" className="block text-xs font-semibold text-text-main">
            عنوان هدف
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="مثلاً: حل ۵۰۰ تست ریاضی یا تکمیل دوره یادگیری عمیق"
            className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label htmlFor="categoryId" className="block text-xs font-semibold text-text-main">
            حوزه (دسته‌بندی)
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

        {/* Target and Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="targetValue" className="block text-xs font-semibold text-text-main">
              مقدار هدف
            </label>
            <input
              id="targetValue"
              name="targetValue"
              type="number"
              required
              min="1"
              placeholder="مثلاً: 500"
              className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="unit" className="block text-xs font-semibold text-text-main">
              واحد اندازه‌گیری
            </label>
            <input
              id="unit"
              name="unit"
              type="text"
              required
              placeholder="تست، ساعت، فصل"
              className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Progress Source */}
        <div className="space-y-1.5">
          <label htmlFor="progressSource" className="block text-xs font-semibold text-text-main">
            منبع محاسبه پیشرفت
          </label>
          <select
            id="progressSource"
            name="progressSource"
            className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="MANUAL">دستی (Manual)</option>
            <option value="SESSION_DURATION">زمان جلسات تمرکز (Session Duration)</option>
            <option value="SESSION_QUESTIONS">تعداد تست‌های حل‌شده (Session Questions)</option>
            <option value="HABIT_SUM">تجمع مقادیر عادت مرتبط (Habit Sum)</option>
            <option value="PROJECT_TASKS">تکمیل تسک‌های پروژه (Project Tasks)</option>
          </select>
        </div>

        {/* Deadline */}
        <div className="space-y-1.5">
          <label htmlFor="deadlineDate" className="block text-xs font-semibold text-text-main">
            مهلت زمانی (Deadline - اختیاری)
          </label>
          <input
            id="deadlineDate"
            name="deadlineDate"
            type="date"
            className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <Link
            href="/goals"
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:bg-elevated transition-colors"
          >
            انصراف
          </Link>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:opacity-95 transition-opacity"
          >
            ذخیره هدف
          </button>
        </div>
      </form>
    </div>
  );
}
