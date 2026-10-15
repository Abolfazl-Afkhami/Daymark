import { db } from '@/db/client';
import { categories, goals } from '@/db/schema';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createProjectAction } from '@/application/actions/project-actions';
import { DatePickerDropdown } from '@/components/ui/DatePickerDropdown';

export default async function NewProjectPage() {
  const allCategories = await db.select().from(categories).all();
  const allGoals = await db.select().from(goals).all();

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/projects"
          className="p-1.5 rounded-lg hover:bg-elevated text-text-muted hover:text-text-main transition-colors"
        >
          <ArrowRight className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">تعریف پروژه جدید (New Project)</h1>
          <p className="text-xs text-text-muted">ایجاد پروژه و اتصال اختیاری آن به اهداف</p>
        </div>
      </div>

      <form action={createProjectAction} className="bg-surface p-5 rounded-xl border border-border-subtle shadow-sm space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <label htmlFor="title" className="block text-xs font-semibold text-text-main">
            عنوان پروژه
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="مثلاً: سیستم گفتار هوش مصنوعی یا توسعه ماژول دیتابیس"
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

        {/* Goal Link */}
        {allGoals.length > 0 && (
          <div className="space-y-1.5">
            <label htmlFor="goalId" className="block text-xs font-semibold text-text-main">
              اتصال به هدف (اختیاری)
            </label>
            <select
              id="goalId"
              name="goalId"
              className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">بدون اتصال به هدف</option>
              {allGoals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Description */}
        <div className="space-y-1.5">
          <label htmlFor="description" className="block text-xs font-semibold text-text-main">
            توضیحات
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="اهداف و گستره فنی پروژه..."
            className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Deadline */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-main">
            مهلت تحویل پروژه (Deadline - اختیاری)
          </label>
          <DatePickerDropdown
            name="deadlineDate"
            placeholder="انتخاب موعد تحویل پروژه..."
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <Link
            href="/projects"
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:bg-elevated transition-colors"
          >
            انصراف
          </Link>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:opacity-95 transition-opacity"
          >
            ذخیره پروژه
          </button>
        </div>
      </form>
    </div>
  );
}
